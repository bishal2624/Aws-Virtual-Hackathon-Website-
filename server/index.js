import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';
import { RegistrationSchema, SubmissionSchema } from './validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

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

// CORS configuration (allow local dev server origin)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '256kb' }));

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

app.use('/api/', publicApiLimiter);

// In-memory data store for registrations and submissions
const registrationsDb = new Map();
const submissionsDb = new Map();

// Clock getter (can be injected or mocked in tests)
let clockOverride = null;
export function setClockOverride(fn) {
  clockOverride = fn;
}
export function getNow() {
  return clockOverride ? clockOverride() : new Date();
}

// 1. Public Event Configuration Endpoint
app.get('/api/config', (req, res) => {
  res.json({
    name: 'AWS Virtual Hackathon 2026',
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

// 2. Registration API Endpoint
app.post('/api/registrations', registrationLimiter, (req, res) => {
  try {
    const validated = RegistrationSchema.parse(req.body);

    // Case-insensitive duplicate email rejection
    const emailKey = validated.email.toLowerCase();
    if (registrationsDb.has(emailKey)) {
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

    registrationsDb.set(emailKey, record);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      referenceCode: regId,
      record: {
        id: regId,
        fullName: record.fullName,
        email: record.email,
        teamName: record.teamName || 'Individual Builder',
        trackId: record.trackId
      }
    });
  } catch (err) {
    if (err instanceof ZodError || err.name === 'ZodError' || err.issues || err.errors) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        error: 'Validation failed',
        details: issues.map(e => ({ field: (e.path || []).join('.'), message: e.message }))
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Project Submission API Endpoint
app.post('/api/submissions', submissionLimiter, (req, res) => {
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

    submissionsDb.set(submissionId, record);

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
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Block dotfiles and hidden directories
app.use((req, res, next) => {
  if (req.path.startsWith('/.') || req.path.includes('/.')) {
    return res.status(404).send('Not Found');
  }
  next();
});

// Central generic error handler (no stack traces leaked in production)
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'A server error occurred. Please try again.' });
});

export default app;

// Run directly if called as main
if (process.argv[1] && /server[/\\]index\.js$/.test(process.argv[1])) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}
