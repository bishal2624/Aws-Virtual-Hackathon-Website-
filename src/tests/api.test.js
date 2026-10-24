import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app, { setClockOverride } from '../../server/index.js';
import * as db from '../../server/db.js';

describe('API Endpoints, Server Validation & Database Persistence', () => {
  beforeEach(() => {
    // Reset clock override before each test to within active submission window
    setClockOverride(() => new Date('2026-11-02T12:00:00+05:30'));
  });

  describe('GET /api/config', () => {
    it('returns event configuration and server time without secrets', async () => {
      const res = await request(app).get('/api/config');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Hack - To - ween');
      expect(res.body.collaborationBanner).toBe('AWS SBG IITJ × AWS SBG GSMCOE');
      expect(res.body.serverTimeIso).toBeDefined();

      // Ensure no secret or credential tokens exist in config response
      const jsonStr = JSON.stringify(res.body);
      expect(jsonStr).not.toContain('password');
      expect(jsonStr).not.toContain('secret');
      expect(jsonStr).not.toContain('token');
    });
  });

  describe('GET /api/health', () => {
    it('returns healthy status and database connection state', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Security & Dotfile Protection', () => {
    it('blocks access to dotfiles such as /.env with 404', async () => {
      const res = await request(app).get('/.env');
      expect(res.status).toBe(404);
    });

    it('blocks access to nested dotfiles such as /.git/config with 404', async () => {
      const res = await request(app).get('/.git/config');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/registrations', () => {
    it('successfully creates and persists a valid registration', async () => {
      const uniqueEmail = `builder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@example.com`;
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Ada Lovelace',
          email: uniqueEmail,
          institution: 'IIT Jodhpur',
          teamName: 'Analytical Engine',
          teamSize: 2,
          trackId: 'track-1',
          consent: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceCode).toMatch(/^REG-2026-[A-Z0-9]+$/);
      expect(res.body.record.email).toBe(uniqueEmail.toLowerCase());

      // Verify actual persistence in database
      const persisted = await db.getRegistrationByEmail(uniqueEmail);
      expect(persisted).toBeDefined();
      expect(persisted.full_name || persisted.fullName).toBe('Ada Lovelace');
    });

    it('rejects duplicate email registrations case-insensitively', async () => {
      const email = `dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@test.org`;
      const payload = {
        fullName: 'Grace Hopper',
        email,
        institution: 'GSMCOE',
        teamName: 'Compiler Pioneers',
        teamSize: 1,
        trackId: 'track-2',
        consent: true
      };

      const res1 = await request(app).post('/api/registrations').send(payload);
      expect(res1.status).toBe(201);

      // Attempt duplicate with uppercase email
      const res2 = await request(app).post('/api/registrations').send({
        ...payload,
        email: email.toUpperCase()
      });
      expect(res2.status).toBe(409);
      expect(res2.body.error).toContain('already submitted');
    });

    it('fails when consent is false', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Test User',
          email: 'test_noconsent@example.com',
          institution: 'Test Institute',
          consent: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('fails when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Test User',
          email: 'invalid-email-address',
          institution: 'Test Institute',
          consent: true
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.field.includes('email'))).toBe(true);
    });

    it('fails when required fields are empty', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: '',
          email: '',
          institution: '',
          consent: true
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('handles unexpected database errors gracefully with 500 JSON', async () => {
      const spy = vi.spyOn(db, 'saveRegistration').mockRejectedValueOnce(new Error('Connection timeout to DB pool'));

      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Db Error Tester',
          email: `dberr_${Date.now()}@example.com`,
          institution: 'IITJ',
          consent: true
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to record registration in database. Please try again.');
      // Ensure stack trace or connection string is not leaked to client
      expect(JSON.stringify(res.body)).not.toContain('Connection timeout');

      spy.mockRestore();
    });
  });

  describe('POST /api/submissions', () => {
    const validSubmission = {
      projectName: 'CloudPulse Observer',
      teamName: 'Aurora Builders',
      leaderName: 'Alan Turing',
      email: 'turing@example.org',
      trackId: 'track-2',
      description: 'Distributed serverless event monitor with automatic failover.',
      problemStatement: 'High latency and unhandled exceptions in multi-region deployments.',
      architectureDescription: 'AWS Lambda functions triggered by Amazon EventBridge rules with Amazon DynamoDB persistence.',
      repoUrl: 'https://github.com/aurora-builders/cloudpulse',
      liveDemoUrl: 'https://cloudpulse-demo.app',
      awsServicesUsed: ['AWS Lambda', 'Amazon DynamoDB', 'Amazon EventBridge']
    };

    it('accepts and persists a valid submission within deadline', async () => {
      const res = await request(app)
        .post('/api/submissions')
        .send(validSubmission);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.submissionId).toMatch(/^SUB-2026-[A-Z0-9]+$/);

      // Verify actual persistence in database
      const persisted = await db.getSubmissionById(res.body.submissionId);
      expect(persisted).toBeDefined();
      expect(persisted.project_name || persisted.projectName).toBe(validSubmission.projectName);
    });

    it('rejects submission containing AWS access keys (AKIA pattern)', async () => {
      const maliciousPayload = {
        ...validSubmission,
        architectureDescription: 'Our system connects with AWS credentials AKIAIOSFODNN7EXAMPLE securely.'
      };

      const res = await request(app)
        .post('/api/submissions')
        .send(maliciousPayload);

      expect(res.status).toBe(400);
      expect(res.body.details[0].message).toContain('Cloud access keys');
    });

    it('rejects repository URL from non-allowed host or with credentials', async () => {
      const invalidRepoPayload = {
        ...validSubmission,
        repoUrl: 'https://user:pass@unknown-git-host.com/project'
      };

      const res = await request(app)
        .post('/api/submissions')
        .send(invalidRepoPayload);

      expect(res.status).toBe(400);
    });

    it('rejects submission with non-https live demo URL', async () => {
      const invalidDemoPayload = {
        ...validSubmission,
        liveDemoUrl: 'http://insecure-demo.com'
      };

      const res = await request(app)
        .post('/api/submissions')
        .send(invalidDemoPayload);

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.field.includes('liveDemoUrl'))).toBe(true);
    });

    it('rejects submission with short description under 20 characters', async () => {
      const shortDescPayload = {
        ...validSubmission,
        description: 'Too short'
      };

      const res = await request(app)
        .post('/api/submissions')
        .send(shortDescPayload);

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.field.includes('description'))).toBe(true);
    });

    it('enforces server clock deadline: accepts at 23:59:59 IST and rejects at 00:00:00 IST', async () => {
      // 1. Accepted right before deadline
      setClockOverride(() => new Date('2026-11-05T23:59:59+05:30'));
      const beforeDeadlineRes = await request(app)
        .post('/api/submissions')
        .send(validSubmission);
      expect(beforeDeadlineRes.status).toBe(201);

      // 2. Rejected 1 second after deadline
      setClockOverride(() => new Date('2026-11-06T00:00:00+05:30'));
      const afterDeadlineRes = await request(app)
        .post('/api/submissions')
        .send(validSubmission);
      expect(afterDeadlineRes.status).toBe(403);
      expect(afterDeadlineRes.body.error).toContain('Submission window is closed');
    });

    it('handles unexpected database write errors with 500 JSON without leaking stack traces', async () => {
      const spy = vi.spyOn(db, 'saveSubmission').mockRejectedValueOnce(new Error('Disk full write fault'));

      const res = await request(app)
        .post('/api/submissions')
        .send(validSubmission);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to persist submission in database. Please try again.');
      expect(JSON.stringify(res.body)).not.toContain('Disk full write fault');

      spy.mockRestore();
    });
  });
});
