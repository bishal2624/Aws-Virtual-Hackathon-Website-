import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app, { setClockOverride } from '../../server/index.js';
import * as db from '../../server/db.js';

describe('Admin Submissions API & Details Integration', () => {
  let adminCookie = '';

  beforeEach(async () => {
    // Reset clock override to active window
    setClockOverride(() => new Date('2026-11-02T12:00:00+05:30'));

    // Authenticate organizer
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({
        username: 'organizer',
        password: process.env.ADMIN_PASSWORD || 'HackToWeen2026!Organizer'
      });

    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'];
    if (Array.isArray(cookies)) {
      adminCookie = cookies.map(c => c.split(';')[0]).join('; ');
    } else {
      adminCookie = cookies.split(';')[0];
    }
  });

  describe('Security & Authorization', () => {
    it('rejects unauthenticated request to /api/admin/submissions with 401', async () => {
      const res = await request(app).get('/api/admin/submissions');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects unauthenticated request to /api/admin/submissions/:id with 401', async () => {
      const res = await request(app).get('/api/admin/submissions/SUB-2026-FAKE01');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });
  });

  describe('Submission Persistence & Admin Retrieval', () => {
    it('persists all submission fields and links registration reference ID when registered', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const email = `sub_leader_${uniqueSuffix}@cloudarchitects.io`;

      // 1. First register the participant so they have a registration ID
      const regRes = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Grace Hopper',
          email,
          institution: 'Vassar College',
          teamName: 'Compiler Crew',
          teamSize: 2,
          trackId: 'track-2',
          consent: true
        });

      expect(regRes.status).toBe(201);
      const registeredRef = regRes.body.referenceCode;

      // 2. Submit the project
      const subPayload = {
        projectName: `Haunted Cloud Engine ${uniqueSuffix}`,
        teamName: 'Compiler Crew',
        leaderName: 'Grace Hopper',
        email,
        trackId: 'track-2',
        problemStatement: 'Solving distributed latency in edge computing networks.',
        description: 'A resilient serverless processing platform built on AWS Lambda and DynamoDB.',
        architectureDescription: 'API Gateway triggers Lambda functions which stream events to DynamoDB and S3.',
        repoUrl: 'https://github.com/cloudarchitects/haunted-engine',
        liveDemoUrl: 'https://haunted-engine.awsapprunner.com',
        videoUrl: 'https://youtube.com/watch?v=sampledemo',
        awsServicesUsed: ['AWS Lambda', 'Amazon DynamoDB', 'Amazon S3', 'Amazon CloudFront']
      };

      const subRes = await request(app)
        .post('/api/submissions')
        .send(subPayload);

      expect(subRes.status).toBe(201);
      const submissionId = subRes.body.submissionId;
      expect(submissionId).toMatch(/^SUB-2026-[A-Z0-9]+$/);

      // 3. Fetch submissions list as authenticated organizer
      const listRes = await request(app)
        .get('/api/admin/submissions')
        .set('Cookie', adminCookie);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.submissions).toBeDefined();
      expect(Array.isArray(listRes.body.submissions)).toBe(true);
      expect(listRes.body.metrics.totalSubmissions).toBeGreaterThanOrEqual(1);

      // 4. Fetch the specific complete submission details
      const detailRes = await request(app)
        .get(`/api/admin/submissions/${submissionId}`)
        .set('Cookie', adminCookie);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.success).toBe(true);
      const record = detailRes.body.submission;

      // Verify EVERY required field is present and untruncated
      expect(record.id).toBe(submissionId);
      expect(record.projectName).toBe(subPayload.projectName);
      expect(record.teamName).toBe('Compiler Crew');
      expect(record.leaderName).toBe('Grace Hopper');
      expect(record.email).toBe(email.toLowerCase());
      expect(record.trackId).toBe('track-2');
      expect(record.problemStatement).toBe(subPayload.problemStatement);
      expect(record.description).toBe(subPayload.description);
      expect(record.architectureDescription).toBe(subPayload.architectureDescription);
      expect(record.repoUrl).toBe(subPayload.repoUrl);
      expect(record.liveDemoUrl).toBe(subPayload.liveDemoUrl);
      expect(record.videoUrl).toBe(subPayload.videoUrl);
      expect(record.awsServicesUsed).toEqual(subPayload.awsServicesUsed);
      expect(record.status).toBe('SUBMITTED');
      expect(record.registrationId).toBe(registeredRef);
      expect(record.submittedAt).toBeDefined();
    });

    it('returns 404 for non-existent submission ID', async () => {
      const res = await request(app)
        .get('/api/admin/submissions/SUB-2026-NOTFOUND99')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    it('filters submissions by track and searches by project/team/leader', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const email = `filter_leader_${uniqueSuffix}@example.com`;

      await request(app)
        .post('/api/submissions')
        .send({
          projectName: `Specter Search Query ${uniqueSuffix}`,
          teamName: `Phantom Detectives ${uniqueSuffix}`,
          leaderName: 'Sherlock Specter',
          email,
          trackId: 'track-3',
          problemStatement: 'Investigating spectral anomalies in log streams.',
          description: 'DevOps automation pipeline parsing CloudWatch logs with machine learning.',
          architectureDescription: 'CloudWatch alarms trigger SNS notifications routed to Lambda analyzers.',
          repoUrl: 'https://github.com/specter/phantom-detectives',
          liveDemoUrl: 'https://phantom-detectives.com',
          awsServicesUsed: ['Amazon CloudWatch', 'AWS Lambda', 'Amazon SNS']
        });

      // Search by project name
      const searchRes = await request(app)
        .get(`/api/admin/submissions?search=Specter`)
        .set('Cookie', adminCookie);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.submissions.length).toBeGreaterThanOrEqual(1);
      const match = searchRes.body.submissions.find(s => s.leaderName === 'Sherlock Specter');
      expect(match).toBeDefined();

      // Filter by track-3
      const trackRes = await request(app)
        .get(`/api/admin/submissions?track=track-3`)
        .set('Cookie', adminCookie);

      expect(trackRes.status).toBe(200);
      expect(trackRes.body.submissions.every(s => s.trackId === 'track-3')).toBe(true);
    });
  });
});
