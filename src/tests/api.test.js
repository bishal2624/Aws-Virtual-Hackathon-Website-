import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { setClockOverride } from '../../server/index.js';

describe('API Endpoints & Server Validation', () => {
  beforeEach(() => {
    // Reset clock override before each test to within active submission window
    setClockOverride(() => new Date('2026-11-02T12:00:00+05:30'));
  });

  describe('GET /api/config', () => {
    it('returns event configuration and server time without secrets', async () => {
      const res = await request(app).get('/api/config');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('AWS Virtual Hackathon 2026');
      expect(res.body.collaborationBanner).toBe('AWS SBG IITJ × AWS SBG GSMCOE');
      expect(res.body.serverTimeIso).toBeDefined();

      // Ensure no secret or credential tokens exist in config response
      const jsonStr = JSON.stringify(res.body);
      expect(jsonStr).not.toContain('password');
      expect(jsonStr).not.toContain('secret');
      expect(jsonStr).not.toContain('token');
    });
  });

  describe('POST /api/registrations', () => {
    it('successfully creates a valid registration', async () => {
      const uniqueEmail = `builder_${Date.now()}@example.com`;
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
    });

    it('rejects duplicate email registrations case-insensitively', async () => {
      const email = `dup_${Date.now()}@test.org`;
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
          email: 'test@example.com',
          institution: 'Test Institute',
          consent: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
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

    it('accepts a valid submission within deadline', async () => {
      const res = await request(app)
        .post('/api/submissions')
        .send(validSubmission);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.submissionId).toMatch(/^SUB-2026-[A-Z0-9]+$/);
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
  });
});
