import { afterAll } from 'vitest';
import { closeDb } from '../../server/db.js';

// Tests must never load a developer .env, touch a real database, or send email.
process.env.NODE_ENV = 'test';
process.env.SQLITE_DB_PATH = ':memory:';
delete process.env.DATABASE_URL;
delete process.env.VERCEL;
delete process.env.VERCEL_URL;
delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

// Isolated organizer credentials and signing secret for the test run.
process.env.ADMIN_USERNAME = 'organizer';
process.env.ADMIN_PASSWORD = 'test-only-organizer-password';
process.env.SESSION_SECRET = 'test-only-session-secret-0123456789abcdef';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.PUBLIC_SITE_URL = 'http://localhost:5173';

// Remove any ambient email configuration inherited from the shell.
for (const key of [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_USERNAME',
  'SMTP_PASS',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'SMTP_SECURE',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_PASSWORD',
  'ORGANIZER_NOTIFICATION_EMAIL',
  'ORGANIZER_EMAIL'
]) {
  delete process.env[key];
}

afterAll(async () => {
  await closeDb();
});
