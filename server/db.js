import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sqliteInstance = null;
let pgPoolInstance = null;
let activeProvider = null; // 'sqlite' | 'postgres'

/**
 * Determine database provider based on environment.
 * If DATABASE_URL starts with postgres:// or postgresql://, use PostgreSQL.
 * Otherwise, use persistent node:sqlite with file storage.
 */
export function getDbProvider() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    return 'postgres';
  }
  return 'sqlite';
}

/**
 * Initialize SQLite database connection and run schema migrations.
 */
function initSqlite(dbPath) {
  let targetPath = dbPath || process.env.SQLITE_DB_PATH;
  if (!targetPath) {
    if (process.env.VERCEL) {
      targetPath = '/tmp/hackathon.db';
      console.warn('[DATABASE] NOTICE: Running SQLite in ephemeral /tmp on Vercel. Data will not persist across container lifecycles. Configure a managed PostgreSQL DATABASE_URL in Vercel for permanent storage.');
    } else {
      targetPath = path.join(__dirname, '../data/hackathon.db');
    }
  }

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(targetPath);

  // WAL mode for high concurrency & performance, foreign keys enabled
  if (targetPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  }
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 10000;');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      institution TEXT NOT NULL,
      team_name TEXT,
      team_size INTEGER NOT NULL DEFAULT 1,
      track_id TEXT NOT NULL,
      consent INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      team_name TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      email TEXT NOT NULL,
      track_id TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      description TEXT NOT NULL,
      architecture_description TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      live_demo_url TEXT NOT NULL,
      video_url TEXT,
      aws_services_used TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SUBMITTED',
      registration_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
    CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at);
    CREATE INDEX IF NOT EXISTS idx_registrations_track ON registrations(track_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
  `);

  // Backward-compatible migrations for existing SQLite database
  try {
    db.exec(`ALTER TABLE submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'SUBMITTED';`);
  } catch {}
  try {
    db.exec(`ALTER TABLE submissions ADD COLUMN registration_id TEXT;`);
  } catch {}

  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_submissions_track ON submissions(track_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    `);
  } catch {}

  return db;
}

/**
 * Initialize PostgreSQL pool and run schema migrations.
 */
async function initPostgres(connectionString) {
  const pool = new pg.Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        institution VARCHAR(255) NOT NULL,
        team_name VARCHAR(150),
        team_size INTEGER NOT NULL DEFAULT 1,
        track_id VARCHAR(64) NOT NULL,
        consent BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(64) PRIMARY KEY,
        project_name VARCHAR(150) NOT NULL,
        team_name VARCHAR(150) NOT NULL,
        leader_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        track_id VARCHAR(64) NOT NULL,
        problem_statement TEXT NOT NULL,
        description TEXT NOT NULL,
        architecture_description TEXT NOT NULL,
        repo_url TEXT NOT NULL,
        live_demo_url TEXT NOT NULL,
        video_url TEXT,
        aws_services_used TEXT NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'SUBMITTED',
        registration_id VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_registrations_email_lower ON registrations(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
      CREATE INDEX IF NOT EXISTS idx_registrations_track_id ON registrations(track_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
    `);

    // Backward-compatible migrations for existing PostgreSQL database
    try {
      await client.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status VARCHAR(64) NOT NULL DEFAULT 'SUBMITTED';`);
    } catch {}
    try {
      await client.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS registration_id VARCHAR(64);`);
    } catch {}

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_submissions_track_id ON submissions(track_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
      `);
    } catch {}
  } finally {
    client.release();
  }

  return pool;
}

/**
 * Initialize active database connection.
 * @param {Object} options - { inMemory: boolean, dbPath?: string }
 */
export async function initDb(options = {}) {
  const provider = options.provider || getDbProvider();
  activeProvider = provider;

  if (provider === 'postgres') {
    if (!pgPoolInstance) {
      pgPoolInstance = await initPostgres(process.env.DATABASE_URL);
    }
    return { provider: 'postgres' };
  } else {
    if (!sqliteInstance || options.inMemory || options.dbPath) {
      const dbPath = options.inMemory ? ':memory:' : (options.dbPath || process.env.SQLITE_DB_PATH);
      sqliteInstance = initSqlite(dbPath);
    }
    return { provider: 'sqlite', path: 'sqlite' };
  }
}

/**
 * Normalizes registration database row into consistent JavaScript object.
 */
function normalizeRegistrationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    institution: row.institution,
    teamName: row.team_name || '',
    teamSize: Number(row.team_size) || 1,
    trackId: row.track_id,
    consent: Boolean(row.consent),
    createdAt: typeof row.created_at === 'object' && row.created_at.toISOString
      ? row.created_at.toISOString()
      : String(row.created_at)
  };
}

/**
 * Save a validated participant registration.
 * Throws an error with code 'DUPLICATE_EMAIL' if registration email already exists.
 */
export async function saveRegistration(record) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  if (activeProvider === 'postgres') {
    try {
      const query = `
        INSERT INTO registrations (id, full_name, email, institution, team_name, team_size, track_id, consent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        record.id,
        record.fullName,
        record.email.toLowerCase(),
        record.institution,
        record.teamName || '',
        record.teamSize || 1,
        record.trackId || 'track-1',
        record.consent ? true : false,
        record.registeredAt || new Date().toISOString()
      ];
      const res = await pgPoolInstance.query(query, values);
      return normalizeRegistrationRow(res.rows[0]);
    } catch (err) {
      if (err.code === '23505') { // Postgres unique_violation
        const dupError = new Error('An existing registration was already submitted with this email address.');
        dupError.code = 'DUPLICATE_EMAIL';
        throw dupError;
      }
      throw err;
    }
  } else {
    try {
      const stmt = sqliteInstance.prepare(`
        INSERT INTO registrations (id, full_name, email, institution, team_name, team_size, track_id, consent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.id,
        record.fullName,
        record.email.toLowerCase(),
        record.institution,
        record.teamName || '',
        record.teamSize || 1,
        record.trackId || 'track-1',
        record.consent ? 1 : 0,
        record.registeredAt || new Date().toISOString()
      );
      return {
        id: record.id,
        fullName: record.fullName,
        email: record.email.toLowerCase(),
        institution: record.institution,
        teamName: record.teamName || '',
        teamSize: record.teamSize || 1,
        trackId: record.trackId || 'track-1',
        consent: record.consent ? true : false,
        createdAt: record.registeredAt || new Date().toISOString()
      };
    } catch (err) {
      if (err.message && (err.message.includes('UNIQUE constraint failed') || err.message.includes('PRIMARY KEY'))) {
        const dupError = new Error('An existing registration was already submitted with this email address.');
        dupError.code = 'DUPLICATE_EMAIL';
        throw dupError;
      }
      throw err;
    }
  }
}

/**
 * Retrieve registration by email (case-insensitive).
 */
export async function getRegistrationByEmail(email) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  const normalized = email.toLowerCase().trim();
  if (activeProvider === 'postgres') {
    const res = await pgPoolInstance.query(
      'SELECT * FROM registrations WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [normalized]
    );
    return normalizeRegistrationRow(res.rows[0]);
  } else {
    const row = sqliteInstance.prepare(
      'SELECT * FROM registrations WHERE email = ? COLLATE NOCASE LIMIT 1'
    ).get(normalized);
    return normalizeRegistrationRow(row);
  }
}

/**
 * Query registrations with search, track filtering, sorting, and pagination.
 */
export async function listRegistrations({
  search = '',
  trackId = '',
  sortBy = 'created_at',
  sortOrder = 'DESC',
  page = 1,
  limit = 10
} = {}) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  // Validate sorting fields
  const allowedSortCols = {
    'created_at': 'created_at',
    'createdAt': 'created_at',
    'full_name': 'full_name',
    'fullName': 'full_name',
    'email': 'email',
    'team_name': 'team_name',
    'teamName': 'team_name'
  };
  const sortCol = allowedSortCols[sortBy] || 'created_at';
  const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  if (activeProvider === 'postgres') {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR id ILIKE $${paramIndex} OR team_name ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (trackId && trackId.trim()) {
      conditions.push(`track_id = $${paramIndex}`);
      params.push(trackId.trim());
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM registrations ${whereClause}`;
    const countRes = await pgPoolInstance.query(countQuery, params);
    const totalRecords = Number(countRes.rows[0]?.total || 0);

    const query = `
      SELECT * FROM registrations
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataRes = await pgPoolInstance.query(query, [...params, safeLimit, offset]);
    const records = dataRes.rows.map(normalizeRegistrationRow);

    return {
      records,
      totalRecords,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(totalRecords / safeLimit) || 1
    };
  } else {
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(full_name LIKE ? OR email LIKE ? OR id LIKE ? OR team_name LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (trackId && trackId.trim()) {
      conditions.push('track_id = ?');
      params.push(trackId.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM registrations ${whereClause}`;
    const countRow = sqliteInstance.prepare(countQuery).get(...params);
    const totalRecords = Number(countRow?.total || 0);

    const query = `
      SELECT * FROM registrations
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ? OFFSET ?
    `;
    const rows = sqliteInstance.prepare(query).all(...params, safeLimit, offset);
    const records = rows.map(normalizeRegistrationRow);

    return {
      records,
      totalRecords,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(totalRecords / safeLimit) || 1
    };
  }
}

/**
 * Retrieve high-level registration metrics (total count, by track, and recent count).
 */
export async function getRegistrationMetrics() {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  const oneDayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  if (activeProvider === 'postgres') {
    const totalRes = await pgPoolInstance.query('SELECT COUNT(*) as total FROM registrations');
    const total = Number(totalRes.rows[0]?.total || 0);

    const tracksRes = await pgPoolInstance.query(
      'SELECT track_id, COUNT(*) as count FROM registrations GROUP BY track_id'
    );
    const byTrack = {};
    for (const row of tracksRes.rows) {
      byTrack[row.track_id] = Number(row.count);
    }

    const recentRes = await pgPoolInstance.query(
      'SELECT COUNT(*) as recent FROM registrations WHERE created_at >= $1',
      [oneDayAgoIso]
    );
    const recentCount = Number(recentRes.rows[0]?.recent || 0);

    return { total, byTrack, recentCount };
  } else {
    const totalRow = sqliteInstance.prepare('SELECT COUNT(*) as total FROM registrations').get();
    const total = Number(totalRow?.total || 0);

    const trackRows = sqliteInstance.prepare(
      'SELECT track_id, COUNT(*) as count FROM registrations GROUP BY track_id'
    ).all();
    const byTrack = {};
    for (const row of trackRows) {
      byTrack[row.track_id] = Number(row.count);
    }

    const recentRow = sqliteInstance.prepare(
      'SELECT COUNT(*) as recent FROM registrations WHERE created_at >= ?'
    ).get(oneDayAgoIso);
    const recentCount = Number(recentRow?.recent || 0);

    return { total, byTrack, recentCount };
  }
}

/**
 * Retrieve all registrations for CSV export.
 */
export async function getAllRegistrationsForExport() {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  if (activeProvider === 'postgres') {
    const res = await pgPoolInstance.query('SELECT * FROM registrations ORDER BY created_at DESC');
    return res.rows.map(normalizeRegistrationRow);
  } else {
    const rows = sqliteInstance.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();
    return rows.map(normalizeRegistrationRow);
  }
}

/**
 * Normalizes submission database row to camelCase object with parsed AWS services.
 */
export function normalizeSubmissionRow(row) {
  if (!row) return null;
  let awsServices = [];
  try {
    awsServices = typeof row.aws_services_used === 'string'
      ? JSON.parse(row.aws_services_used)
      : (row.aws_services_used || []);
  } catch {
    awsServices = [String(row.aws_services_used || 'AWS')];
  }

  return {
    id: row.id,
    projectName: row.project_name || row.projectName || '',
    teamName: row.team_name || row.teamName || '',
    leaderName: row.leader_name || row.leaderName || '',
    email: row.email || '',
    trackId: row.track_id || row.trackId || 'track-1',
    problemStatement: row.problem_statement || row.problemStatement || '',
    description: row.description || '',
    architectureDescription: row.architecture_description || row.architectureDescription || '',
    repoUrl: row.repo_url || row.repoUrl || '',
    liveDemoUrl: row.live_demo_url || row.liveDemoUrl || '',
    videoUrl: row.video_url || row.videoUrl || null,
    awsServicesUsed: awsServices,
    status: row.status || 'SUBMITTED',
    registrationId: row.registration_id || row.registrationId || null,
    submittedAt: row.created_at || row.submittedAt || row.createdAt
  };
}

/**
 * Save a validated project submission.
 */
export async function saveSubmission(record) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  const servicesJson = Array.isArray(record.awsServicesUsed)
    ? JSON.stringify(record.awsServicesUsed)
    : JSON.stringify([record.awsServicesUsed || 'AWS']);

  const status = record.status || 'SUBMITTED';

  let registrationId = record.registrationId || null;
  if (!registrationId && record.email) {
    try {
      const reg = await getRegistrationByEmail(record.email);
      if (reg) {
        registrationId = reg.id;
      }
    } catch {}
  }

  const submittedAt = record.submittedAt || new Date().toISOString();

  if (activeProvider === 'postgres') {
    const query = `
      INSERT INTO submissions (
        id, project_name, team_name, leader_name, email, track_id,
        problem_statement, description, architecture_description,
        repo_url, live_demo_url, video_url, aws_services_used,
        status, registration_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const values = [
      record.id,
      record.projectName,
      record.teamName,
      record.leaderName,
      record.email.toLowerCase(),
      record.trackId,
      record.problemStatement,
      record.description,
      record.architectureDescription,
      record.repoUrl,
      record.liveDemoUrl,
      record.videoUrl || null,
      servicesJson,
      status,
      registrationId,
      submittedAt
    ];
    const res = await pgPoolInstance.query(query, values);
    return normalizeSubmissionRow(res.rows[0]);
  } else {
    const stmt = sqliteInstance.prepare(`
      INSERT INTO submissions (
        id, project_name, team_name, leader_name, email, track_id,
        problem_statement, description, architecture_description,
        repo_url, live_demo_url, video_url, aws_services_used,
        status, registration_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      record.id,
      record.projectName,
      record.teamName,
      record.leaderName,
      record.email.toLowerCase(),
      record.trackId,
      record.problemStatement,
      record.description,
      record.architectureDescription,
      record.repoUrl,
      record.liveDemoUrl,
      record.videoUrl || null,
      servicesJson,
      status,
      registrationId,
      submittedAt
    );
    return normalizeSubmissionRow({
      ...record,
      status,
      registration_id: registrationId,
      created_at: submittedAt,
      aws_services_used: servicesJson
    });
  }
}

/**
 * Retrieve submission by ID with normalized fields.
 */
export async function getSubmissionById(id) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  if (activeProvider === 'postgres') {
    const res = await pgPoolInstance.query(
      'SELECT * FROM submissions WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] ? normalizeSubmissionRow(res.rows[0]) : null;
  } else {
    const row = sqliteInstance.prepare(
      'SELECT * FROM submissions WHERE id = ? LIMIT 1'
    ).get(id);
    return row ? normalizeSubmissionRow(row) : null;
  }
}

/**
 * Paginated and filtered retrieval of project submissions for Admin Dashboard.
 */
export async function listSubmissions({
  search = '',
  track = '',
  status = '',
  sortBy = 'created_at',
  sortOrder = 'DESC',
  page = 1,
  limit = 20
} = {}) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  const offset = Math.max(0, (page - 1) * limit);
  const normalizedOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const validSortColumns = {
    created_at: 'created_at',
    project_name: 'project_name',
    team_name: 'team_name',
    leader_name: 'leader_name',
    status: 'status'
  };
  const sortCol = validSortColumns[sortBy] || 'created_at';

  if (activeProvider === 'postgres') {
    let whereClauses = [];
    let queryParams = [];
    let paramIdx = 1;

    if (search && search.trim()) {
      whereClauses.push(`(
        project_name ILIKE $${paramIdx} OR
        team_name ILIKE $${paramIdx} OR
        leader_name ILIKE $${paramIdx} OR
        email ILIKE $${paramIdx} OR
        id ILIKE $${paramIdx}
      )`);
      queryParams.push(`%${search.trim()}%`);
      paramIdx++;
    }

    if (track && track.trim()) {
      whereClauses.push(`track_id = $${paramIdx}`);
      queryParams.push(track.trim());
      paramIdx++;
    }

    if (status && status.trim()) {
      whereClauses.push(`status = $${paramIdx}`);
      queryParams.push(status.trim());
      paramIdx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as count FROM submissions ${whereSql}`;
    const countRes = await pgPoolInstance.query(countSql, queryParams);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const recordsSql = `
      SELECT * FROM submissions
      ${whereSql}
      ORDER BY ${sortCol} ${normalizedOrder}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;
    const recordsRes = await pgPoolInstance.query(recordsSql, [...queryParams, limit, offset]);

    const metricsSql = `
      SELECT
        COUNT(*) as total,
        track_id,
        status
      FROM submissions
      GROUP BY track_id, status
    `;
    const metricsRes = await pgPoolInstance.query(metricsSql);

    const byTrack = {};
    const byStatus = {};
    let totalSubmissions = 0;
    for (const r of metricsRes.rows) {
      const c = parseInt(r.total, 10);
      totalSubmissions += c;
      byTrack[r.track_id] = (byTrack[r.track_id] || 0) + c;
      byStatus[r.status] = (byStatus[r.status] || 0) + c;
    }

    return {
      submissions: recordsRes.rows.map(normalizeSubmissionRow),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1
      },
      metrics: {
        totalSubmissions,
        byTrack,
        byStatus
      }
    };
  } else {
    // SQLite
    let whereClauses = [];
    let queryParams = [];

    if (search && search.trim()) {
      whereClauses.push(`(
        project_name LIKE ? OR
        team_name LIKE ? OR
        leader_name LIKE ? OR
        email LIKE ? OR
        id LIKE ?
      )`);
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term, term, term);
    }

    if (track && track.trim()) {
      whereClauses.push(`track_id = ?`);
      queryParams.push(track.trim());
    }

    if (status && status.trim()) {
      whereClauses.push(`status = ?`);
      queryParams.push(status.trim());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countStmt = sqliteInstance.prepare(`SELECT COUNT(*) as count FROM submissions ${whereSql}`);
    const countRow = countStmt.get(...queryParams);
    const totalCount = countRow ? Number(countRow.count) : 0;

    const recordsStmt = sqliteInstance.prepare(`
      SELECT * FROM submissions
      ${whereSql}
      ORDER BY ${sortCol} ${normalizedOrder}
      LIMIT ? OFFSET ?
    `);
    const rows = recordsStmt.all(...queryParams, limit, offset);

    const metricsRows = sqliteInstance.prepare(`
      SELECT COUNT(*) as count, track_id, status FROM submissions GROUP BY track_id, status
    `).all();

    const byTrack = {};
    const byStatus = {};
    let totalSubmissions = 0;
    for (const r of metricsRows) {
      const c = Number(r.count);
      totalSubmissions += c;
      byTrack[r.track_id] = (byTrack[r.track_id] || 0) + c;
      byStatus[r.status] = (byStatus[r.status] || 0) + c;
    }

    return {
      submissions: rows.map(normalizeSubmissionRow),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1
      },
      metrics: {
        totalSubmissions,
        byTrack,
        byStatus
      }
    };
  }
}

/**
 * Delete registrations by ID array.
 * Sets registration_id = NULL in submissions for referential integrity.
 */
export async function deleteRegistrations(ids) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  if (!Array.isArray(ids)) {
    return { deletedCount: 0, ids: [] };
  }

  const cleanIds = Array.from(new Set(ids.map(id => String(id).trim()).filter(Boolean)));
  if (cleanIds.length === 0) {
    return { deletedCount: 0, ids: [] };
  }

  if (cleanIds.length > 200) {
    throw new Error('Batch limit exceeded (maximum 200 records per operation)');
  }

  if (activeProvider === 'postgres') {
    const placeholders = cleanIds.map((_, i) => `$${i + 1}`).join(', ');
    // Safely nullify referencing submissions to protect submission records
    await pgPoolInstance.query(
      `UPDATE submissions SET registration_id = NULL WHERE registration_id IN (${placeholders})`,
      cleanIds
    );
    const res = await pgPoolInstance.query(
      `DELETE FROM registrations WHERE id IN (${placeholders})`,
      cleanIds
    );
    return { deletedCount: Number(res.rowCount) || 0, ids: cleanIds };
  } else {
    const placeholders = cleanIds.map(() => '?').join(', ');
    // Safely nullify referencing submissions
    sqliteInstance.prepare(
      `UPDATE submissions SET registration_id = NULL WHERE registration_id IN (${placeholders})`
    ).run(...cleanIds);
    const res = sqliteInstance.prepare(
      `DELETE FROM registrations WHERE id IN (${placeholders})`
    ).run(...cleanIds);
    return { deletedCount: Number(res.changes) || 0, ids: cleanIds };
  }
}

export async function deleteRegistration(id) {
  return deleteRegistrations([id]);
}

/**
 * Delete project submissions by ID array.
 */
export async function deleteSubmissions(ids) {
  if (!sqliteInstance && !pgPoolInstance) {
    await initDb();
  }

  if (!Array.isArray(ids)) {
    return { deletedCount: 0, ids: [] };
  }

  const cleanIds = Array.from(new Set(ids.map(id => String(id).trim()).filter(Boolean)));
  if (cleanIds.length === 0) {
    return { deletedCount: 0, ids: [] };
  }

  if (cleanIds.length > 200) {
    throw new Error('Batch limit exceeded (maximum 200 records per operation)');
  }

  if (activeProvider === 'postgres') {
    const placeholders = cleanIds.map((_, i) => `$${i + 1}`).join(', ');
    const res = await pgPoolInstance.query(
      `DELETE FROM submissions WHERE id IN (${placeholders})`,
      cleanIds
    );
    return { deletedCount: Number(res.rowCount) || 0, ids: cleanIds };
  } else {
    const placeholders = cleanIds.map(() => '?').join(', ');
    const res = sqliteInstance.prepare(
      `DELETE FROM submissions WHERE id IN (${placeholders})`
    ).run(...cleanIds);
    return { deletedCount: Number(res.changes) || 0, ids: cleanIds };
  }
}

export async function deleteSubmission(id) {
  return deleteSubmissions([id]);
}

/**
 * Health check verification for database connectivity.
 */
export async function checkDbHealth() {
  try {
    if (!sqliteInstance && !pgPoolInstance) {
      await initDb();
    }
    if (activeProvider === 'postgres') {
      const res = await pgPoolInstance.query('SELECT 1 as healthy');
      return { ok: res.rows[0].healthy === 1, provider: 'postgres' };
    } else {
      const row = sqliteInstance.prepare('SELECT 1 as healthy').get();
      return { ok: row.healthy === 1, provider: 'sqlite' };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Gracefully close database connections (useful for test suites and shutdown).
 */
export async function closeDb() {
  if (sqliteInstance) {
    try {
      sqliteInstance.close();
    } catch {}
    sqliteInstance = null;
  }
  if (pgPoolInstance) {
    try {
      await pgPoolInstance.end();
    } catch {}
    pgPoolInstance = null;
  }
  activeProvider = null;
}
