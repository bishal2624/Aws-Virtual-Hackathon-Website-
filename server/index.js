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
  getSessionCookieOptions
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

// CORS configuration (allow local dev server, configured origins, Vercel deployments, and public site URL)
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Check explicitly configured origins
    if (configuredOrigins.includes(origin)) return callback(null, true);

    // Check configured PUBLIC_SITE_URL
    if (process.env.PUBLIC_SITE_URL && origin === process.env.PUBLIC_SITE_URL.replace(/\/$/, '')) {
      return callback(null, true);
    }

    // Automatically allow *.vercel.app for preview and production deployments of this app
    try {
      const parsed = new URL(origin);
      if (parsed.hostname.endsWith('.vercel.app') || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch {}

    // Gracefully decline unrecognized origins
    callback(null, false);
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
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
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
  res.json({
    name: 'Hack - To - ween',
    collaborationBanner: 'AWS SBG IITJ × AWS SBG GSMCOE',
    organizerLine: 'Organized by AWS Student Builder Groups, IIT Jodhpur, and GSMCOE.',
    schedule: {
      kickoffIso: '2026-10-31T00:00:00+05:30',
      submissionDeadlineIso: '2026-11-05T23:59:59+05:30',
      timezone: 'Asia/Kolkata (IST)'
    },
    registrationStatus: 'OPEN',
    serverTimeIso: getNow().toISOString()
  });
});

// Registration API Endpoint with Real Database Persistence & Notifications
app.post('/api/registrations', registrationLimiter, async (req, res) => {
  try {
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

    // Send participant confirmation email after successful database persistence
    let emailSent = false;
    try {
      const emailResult = await sendParticipantConfirmation(saved);
      emailSent = Boolean(emailResult?.sent);
    } catch (notifyErr) {
      console.error('[NOTIFICATIONS] Unexpected error in confirmation dispatch:', notifyErr.message);
      emailSent = false;
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

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const isValid = verifyAdminCredentials(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid organizer credentials' });
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

    const [listResult, metrics] = await Promise.all([
      listRegistrations({
        search: search ? String(search) : '',
        trackId: trackId ? String(trackId) : '',
        sortBy: sortBy ? String(sortBy) : 'created_at',
        sortOrder: sortOrder ? String(sortOrder) : 'DESC',
        page: Number(page) || 1,
        limit: Number(limit) || 10
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

    const listResult = await listSubmissions({
      search: search ? String(search) : '',
      track: (trackId || track) ? String(trackId || track) : '',
      status: status ? String(status) : '',
      sortBy: sortBy ? String(sortBy) : 'created_at',
      sortOrder: sortOrder ? String(sortOrder) : 'DESC',
      page: Number(page) || 1,
      limit: Number(limit) || 20
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
