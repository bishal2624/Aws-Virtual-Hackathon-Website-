import './env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';
import { RegistrationSchema, SubmissionSchema } from './validators.js';
import {
  initDb,
  saveRegistration,
  getRegistrationByEmail,
  listRegistrations,
  getRegistrationMetrics,
  getAllRegistrationsForExport,
  deleteRegistrations,
  deleteRegistration,
  saveSubmission,
  getSubmissionById,
  listSubmissions,
  deleteSubmissions,
  deleteSubmission,
  checkDbHealth,
  closeDb
} from './db.js';
import {
  verifyAdminCredentials,
  createSession,
  revokeSession,
  requireAdminAuth,
  getSessionCookieOptions,
  isAdminAuthConfigured,
  isSessionSecretConfigured
} from './auth.js';
import {
  notifyOrganizerOnRegistration,
  sendParticipantConfirmation,
  isEmailConfigured
} from './notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

// Normalize incoming URL for Vercel Serverless Function routing (handles proxy/rewrite headers)
app.use((req, res, next) => {
  const originalUri = req.headers['x-forwarded-uri'] || req.headers['x-original-url'];
  if (originalUri) {
    req.url = originalUri;
  } else if (req.headers['x-matched-path']) {
    const matched = req.headers['x-matched-path'];
    // Avoid overriding req.url if matched path points to internal function filename
    if (!matched.includes('/index.') && !matched.endsWith('/index') && matched.startsWith('/api')) {
      const queryIndex = req.url.indexOf('?');
      const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : '';
      req.url = `${matched}${queryString}`;
    }
  }
  next();
});

// Trust reverse proxy if configured or running in Vercel / serverless edge
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true' || process.env.VERCEL) {
  app.set('trust proxy', 1);
}

// Security middleware via Helmet with strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "blob:"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration: explicit allowlist only.
// Configure ALLOWED_ORIGINS (comma-separated) and/or PUBLIC_SITE_URL in production.
// Vercel provides VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL for this deployment.
function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function buildAllowedOrigins() {
  const origins = new Set();

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',')
      .map(normalizeOrigin)
      .filter(Boolean)
      .forEach(origin => origins.add(origin));
  }

  if (process.env.PUBLIC_SITE_URL) {
    origins.add(normalizeOrigin(process.env.PUBLIC_SITE_URL));
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`);
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${normalizeOrigin(process.env.VERCEL_URL)}`);
  }

  // Local development origins are never allowed in production.
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
    origins.add('http://localhost:4000');
    origins.add('http://127.0.0.1:4000');
  }

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser requests (same-origin, server-to-server, curl) have no Origin header.
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.has(normalizeOrigin(origin)));
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '256kb' }));

// Lazy database initialization middleware for serverless requests
let dbInitPromise = null;
function ensureDbInit() {
  if (!dbInitPromise) {
    dbInitPromise = initDb().catch((err) => {
      dbInitPromise = null;
      console.error('[DATABASE] Initialization error during request:', err.message);
    });
  }
  return dbInitPromise;
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await ensureDbInit();
  }
  next();
});

// Rate limiters
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Registration rate limit reached. Please try again later.' }
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission rate limit reached. Maximum 10 submissions per hour.' }
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});

app.use('/api/', publicApiLimiter);

// Clock getter (can be injected or mocked in tests)
let clockOverride = null;
export function setClockOverride(fn) {
  clockOverride = fn;
}
export function getNow() {
  return clockOverride ? clockOverride() : new Date();
}

// Event deadlines (IST). Registration closes before the hackathon kicks off;
// project submissions remain open until the final submission deadline.
export const REGISTRATION_DEADLINE_MS = new Date('2026-10-30T23:59:59+05:30').getTime();
export const SUBMISSION_DEADLINE_MS = new Date('2026-11-05T23:59:59+05:30').getTime();

export function getRegistrationStatus(now = getNow()) {
  return now.getTime() <= REGISTRATION_DEADLINE_MS ? 'OPEN' : 'CLOSED';
}

// Clamp pagination values so callers cannot request unbounded result sets.
function clampPagination(page, limit, defaultLimit, maxLimit = 100) {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const safePage = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(maxLimit, Math.floor(parsedLimit)))
    : defaultLimit;
  return { page: safePage, limit: safeLimit };
}

// Block dotfiles and hidden directories with HTTP 404
app.use((req, res, next) => {
  if (req.path.startsWith('/.') || req.path.includes('/.')) {
    return res.status(404).send('Not Found');
  }
  next();
});

// CSV Generator Helper
function generateRegistrationsCsv(records) {
  const headers = [
    'Reference Code',
    'Registration Date (UTC)',
    'Full Name',
    'Email Address',
    'Institution',
    'Team Name',
    'Team Size',
    'Challenge Track',
    'Consent Status'
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);

    // Neutralize spreadsheet formula injection. Excel/Sheets treat cells that
    // start with these characters as formulas even when quoted.
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    return `"${str.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.map(escapeCell).join(','),
    ...records.map(r => [
      r.id,
      r.createdAt,
      r.fullName,
      r.email,
      r.institution,
      r.teamName || 'Individual Builder',
      r.teamSize || 1,
      r.trackId,
      r.consent ? 'YES' : 'NO'
    ].map(escapeCell).join(','))
  ];

  return lines.join('\r\n');
}

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Health check endpoint (checks database connectivity)
app.get('/api/health', async (req, res) => {
  try {
    const health = await checkDbHealth();
    const statusCode = health.ok ? 200 : 503;
    res.status(statusCode).json({
      status: health.ok ? 'healthy' : 'degraded',
      database: health.ok ? 'connected' : 'disconnected',
      provider: health.provider || 'unknown',
      emailService: isEmailConfigured() ? 'configured' : 'unconfigured',
      timestamp: getNow().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      emailService: isEmailConfigured() ? 'configured' : 'unconfigured',
      timestamp: getNow().toISOString()
    });
  }
});

// Public Event Configuration Endpoint
app.get('/api/config', (req, res) => {
  const now = getNow();
  res.json({
    name: 'Hack - To - ween',
    collaborationBanner: 'AWS SBG IITJ × AWS SBG GSMCOE',
    organizerLine: 'Organized by AWS Student Builder Groups, IIT Jodhpur, and GSMCOE.',
    schedule: {
      kickoffIso: '2026-10-31T00:00:00+05:30',
      submissionDeadlineIso: '2026-11-05T23:59:59+05:30',
      registrationDeadlineIso: '2026-10-30T23:59:59+05:30',
      timezone: 'Asia/Kolkata (IST)'
    },
    registrationStatus: getRegistrationStatus(now),
    serverTimeIso: now.toISOString()
  });
});

// Registration API Endpoint with Real Database Persistence & Notifications
app.post('/api/registrations', registrationLimiter, async (req, res) => {
  try {
    if (getNow().getTime() > REGISTRATION_DEADLINE_MS) {
      return res.status(403).json({
        error: 'Registration is closed. The final registration deadline was October 30, 2026 at 23:59 IST.',
        registrationStatus: 'CLOSED'
      });
    }

    const validated = RegistrationSchema.parse(req.body);

    // Case-insensitive duplicate email check
    const emailKey = validated.email.toLowerCase();
    const existing = await getRegistrationByEmail(emailKey);
    if (existing) {
      return res.status(409).json({
        error: 'An existing registration was already submitted with this email address.'
      });
    }

    const regId = 'REG-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const record = {
      id: regId,
      ...validated,
      registeredAt: getNow().toISOString()
    };

    // Actual persistent database insert
    const saved = await saveRegistration(record);

    // Send participant confirmation email after successful database persistence.
    // Bound the request latency: SMTP can take tens of seconds when the provider
    // is slow, so wait at most 1.5s and let delivery continue in the background.
    let emailSent = false;
    const emailQueued = isEmailConfigured();

    if (emailQueued) {
      const confirmationPromise = sendParticipantConfirmation(saved)
        .then((result) => {
          if (result?.sent) emailSent = true;
          return result;
        })
        .catch((notifyErr) => {
          console.error('[NOTIFICATIONS] Unexpected error in confirmation dispatch:', notifyErr.message);
          return { sent: false };
        });

      await Promise.race([
        confirmationPromise,
        new Promise((resolve) => {
          const timer = setTimeout(resolve, 1500);
          if (typeof timer.unref === 'function') timer.unref();
        })
      ]);
    }

    // Non-blocking organizer notification
    notifyOrganizerOnRegistration(saved).catch((err) => {
      console.error('[NOTIFICATIONS] Organizer alert dispatch error:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      referenceCode: regId,
      emailSent,
      emailQueued,
      record: {
        id: regId,
        fullName: record.fullName,
        email: record.email,
        teamName: record.teamName || 'Individual Builder',
        trackId: record.trackId
      }
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({
        error: 'An existing registration was already submitted with this email address.'
      });
    }
    if (err instanceof ZodError || err.name === 'ZodError' || err.issues || err.errors) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        error: 'Validation failed',
        details: issues.map(e => ({ field: (e.path || []).join('.'), message: e.message }))
      });
    }
    console.error('Registration error occurred:', err.message);
    return res.status(500).json({ error: 'Failed to record registration in database. Please try again.' });
  }
});

// Project Submission API Endpoint with Real Database Persistence
app.post('/api/submissions', submissionLimiter, async (req, res) => {
  try {
    // Deadline check: default deadline 2026-11-05T23:59:59+05:30
    const deadlineMs = new Date('2026-11-05T23:59:59+05:30').getTime();
    const currentMs = getNow().getTime();

    if (currentMs > deadlineMs) {
      return res.status(403).json({
        error: 'Submission window is closed. Final deadline was November 5, 2026 at 23:59 IST.'
      });
    }

    const validated = SubmissionSchema.parse(req.body);

    const submissionId = 'SUB-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const record = {
      id: submissionId,
      ...validated,
      submittedAt: getNow().toISOString()
    };

    // Actual persistent database insert
    await saveSubmission(record);

    return res.status(201).json({
      success: true,
      message: 'Project submission successfully recorded',
      submissionId,
      projectName: record.projectName,
      submittedAt: record.submittedAt
    });
  } catch (err) {
    if (err instanceof ZodError || err.name === 'ZodError' || err.issues || err.errors) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        error: 'Validation failed',
        details: issues.map(e => ({ field: (e.path || []).join('.'), message: e.message }))
      });
    }
    console.error('Submission error occurred:', err.message);
    return res.status(500).json({ error: 'Failed to persist submission in database. Please try again.' });
  }
});

// ==========================================
// 2. ORGANIZER AUTHENTICATION ROUTES
// ==========================================

// Organizer Login
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  const { username, password } = req.body || {};

  if (!isAdminAuthConfigured()) {
    return res.status(503).json({
      error: 'Organizer authentication is not configured on this server. Set ADMIN_USERNAME and ADMIN_PASSWORD.'
    });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const isValid = verifyAdminCredentials(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid organizer credentials' });
  }

  if (!isSessionSecretConfigured() && process.env.NODE_ENV === 'production') {
    return res.status(503).json({
      error: 'Organizer sessions are not configured on this server. Set SESSION_SECRET.'
    });
  }

  const session = createSession(username);
  res.cookie('hack_admin_session', session.token, getSessionCookieOptions());

  return res.json({
    success: true,
    message: 'Organizer authentication successful',
    token: session.token,
    user: { username }
  });
});

// Organizer Logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.hack_admin_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (token) {
    revokeSession(token);
  }
  res.clearCookie('hack_admin_session', getSessionCookieOptions());
  return res.json({ success: true, message: 'Organizer logged out successfully' });
});

// Verify Current Organizer Session
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  return res.json({
    authenticated: true,
    user: { username: req.adminSession.username }
  });
});

// ==========================================
// 3. ORGANIZER REGISTRATION MANAGEMENT ROUTES
// ==========================================

// List registrations with search, filter, sort, and pagination
app.get('/api/admin/registrations', requireAdminAuth, async (req, res) => {
  try {
    const { search, trackId, sortBy, sortOrder, page, limit } = req.query;
    const pagination = clampPagination(page, limit, 10);

    const [listResult, metrics] = await Promise.all([
      listRegistrations({
        search: search ? String(search) : '',
        trackId: trackId ? String(trackId) : '',
        sortBy: sortBy ? String(sortBy) : 'created_at',
        sortOrder: sortOrder ? String(sortOrder) : 'DESC',
        page: pagination.page,
        limit: pagination.limit
      }),
      getRegistrationMetrics()
    ]);

    return res.json({
      success: true,
      registrations: listResult.records,
      pagination: {
        page: listResult.page,
        limit: listResult.limit,
        totalRecords: listResult.totalRecords,
        totalPages: listResult.totalPages
      },
      metrics
    });
  } catch (err) {
    console.error('Failed to list registrations:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});

// Export all registrations as CSV
app.get('/api/admin/registrations/export.csv', requireAdminAuth, async (req, res) => {
  try {
    const records = await getAllRegistrationsForExport();
    const csvContent = generateRegistrationsCsv(records);

    const todayDate = new Date().toISOString().split('T')[0];
    const filename = `hack-to-ween-registrations-${todayDate}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.send(csvContent);
  } catch (err) {
    console.error('Failed to export registrations CSV:', err.message);
    return res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

// List project submissions with search, filter, sort, and pagination
app.get('/api/admin/submissions', requireAdminAuth, async (req, res) => {
  try {
    const { search, trackId, track, status, sortBy, sortOrder, page, limit } = req.query;
    const pagination = clampPagination(page, limit, 20);

    const listResult = await listSubmissions({
      search: search ? String(search) : '',
      track: (trackId || track) ? String(trackId || track) : '',
      status: status ? String(status) : '',
      sortBy: sortBy ? String(sortBy) : 'created_at',
      sortOrder: sortOrder ? String(sortOrder) : 'DESC',
      page: pagination.page,
      limit: pagination.limit
    });

    return res.json({
      success: true,
      submissions: listResult.submissions,
      pagination: listResult.pagination,
      metrics: listResult.metrics
    });
  } catch (err) {
    console.error('Failed to list submissions:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve project submissions' });
  }
});

// Get complete details for a single project submission
app.get('/api/admin/submissions/:id', requireAdminAuth, async (req, res) => {
  try {
    const submission = await getSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json({
      success: true,
      submission
    });
  } catch (err) {
    console.error('Failed to retrieve submission details:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve submission details' });
  }
});

// Bulk delete registrations
app.delete('/api/admin/registrations/bulk', requireAdminAuth, async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of registration IDs is required' });
    }
    if (ids.length > 200) {
      return res.status(400).json({ error: 'Cannot delete more than 200 records in a single operation' });
    }

    const result = await deleteRegistrations(ids);
    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      ids: result.ids,
      message: `Successfully deleted ${result.deletedCount} registration(s)`
    });
  } catch (err) {
    console.error('Failed to bulk delete registrations:', err.message);
    return res.status(500).json({ error: 'Failed to delete selected registrations' });
  }
});

// Delete single registration
app.delete('/api/admin/registrations/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid registration ID is required' });
    }

    const result = await deleteRegistration(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    return res.json({
      success: true,
      deletedCount: 1,
      id,
      message: 'Registration deleted successfully'
    });
  } catch (err) {
    console.error('Failed to delete registration:', err.message);
    return res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// Bulk delete submissions
app.delete('/api/admin/submissions/bulk', requireAdminAuth, async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of submission IDs is required' });
    }
    if (ids.length > 200) {
      return res.status(400).json({ error: 'Cannot delete more than 200 records in a single operation' });
    }

    const result = await deleteSubmissions(ids);
    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      ids: result.ids,
      message: `Successfully deleted ${result.deletedCount} submission(s)`
    });
  } catch (err) {
    console.error('Failed to bulk delete submissions:', err.message);
    return res.status(500).json({ error: 'Failed to delete selected submissions' });
  }
});

// Delete single submission
app.delete('/api/admin/submissions/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid submission ID is required' });
    }

    const result = await deleteSubmission(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json({
      success: true,
      deletedCount: 1,
      id,
      message: 'Submission deleted successfully'
    });
  } catch (err) {
    console.error('Failed to delete submission:', err.message);
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// 404 Handler for unmatched /api routes
app.all(/^\/api(\/.*)?$/, (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ==========================================
// 4. PRODUCTION STATIC SERVING & ROUTING
// ==========================================

// In Vercel serverless functions, static file and SPA serving are handled by Vercel Edge.
// Only register static SPA handler in standalone Node.js production server.
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// Central generic error handler (no stack traces leaked in production)
app.use((err, req, res, next) => {
  if (err.message === 'Blocked by CORS policy') {
    return res.status(403).json({ error: 'Access forbidden by CORS policy' });
  }
  console.error('[SERVER] Request processing error:', err.message);
  res.status(500).json({ error: 'A server error occurred. Please try again.' });
});

export { initDb, closeDb };
export default app;

// Run directly if called as main process
if (process.argv[1] && /server[/\\]index\.js$/.test(process.argv[1])) {
  const PORT = process.env.PORT || 4000;

  if (process.env.NODE_ENV === 'production') {
    const missing = [];
    if (!isAdminAuthConfigured()) missing.push('ADMIN_USERNAME and ADMIN_PASSWORD');
    if (!isSessionSecretConfigured()) missing.push('SESSION_SECRET (or ADMIN_SESSION_SECRET)');
    if (missing.length > 0) {
      console.error(`[SERVER] Refusing to start in production. Missing required configuration: ${missing.join('; ')}`);
      process.exit(1);
    }
  }

  initDb().then((dbInfo) => {
    console.log(`Database initialized using provider: ${dbInfo.provider}`);
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database on startup:', err);
    process.exit(1);
  });
}
