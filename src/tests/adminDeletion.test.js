import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { setClockOverride } from '../../server/index.js';
import * as db from '../../server/db.js';

describe('Admin Deletion API & Integrity', () => {
  let adminCookie = '';

  beforeEach(async () => {
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

  describe('Security & Authentication Gates', () => {
    it('rejects unauthenticated bulk registration deletion with 401', async () => {
      const res = await request(app)
        .delete('/api/admin/registrations/bulk')
        .send({ ids: ['REG-FAKE-1'] });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects unauthenticated single registration deletion with 401', async () => {
      const res = await request(app)
        .delete('/api/admin/registrations/REG-FAKE-1');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects unauthenticated bulk submission deletion with 401', async () => {
      const res = await request(app)
        .delete('/api/admin/submissions/bulk')
        .send({ ids: ['SUB-FAKE-1'] });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects unauthenticated single submission deletion with 401', async () => {
      const res = await request(app)
        .delete('/api/admin/submissions/SUB-FAKE-1');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });
  });

  describe('Selective Registration Deletion & Data Preservation', () => {
    it('deletes selected registrations in bulk, preserves unselected records, and updates counts', async () => {
      const ts = Date.now().toString(36);
      const email1 = `del_reg1_${ts}@test.org`;
      const email2 = `del_reg2_${ts}@test.org`;
      const emailKeep = `keep_reg_${ts}@test.org`;

      // Create 3 registrations
      const reg1 = await request(app).post('/api/registrations').send({
        fullName: 'Delete One',
        email: email1,
        institution: 'Test Univ',
        teamName: 'Team Del 1',
        teamSize: 1,
        trackId: 'track-1',
        consent: true
      });
      const reg2 = await request(app).post('/api/registrations').send({
        fullName: 'Delete Two',
        email: email2,
        institution: 'Test Univ',
        teamName: 'Team Del 2',
        teamSize: 1,
        trackId: 'track-1',
        consent: true
      });
      const regKeep = await request(app).post('/api/registrations').send({
        fullName: 'Keep Person',
        email: emailKeep,
        institution: 'Test Univ',
        teamName: 'Team Keep',
        teamSize: 1,
        trackId: 'track-1',
        consent: true
      });

      expect(reg1.status).toBe(201);
      expect(reg2.status).toBe(201);
      expect(regKeep.status).toBe(201);

      const id1 = reg1.body.referenceCode;
      const id2 = reg2.body.referenceCode;
      const idKeep = regKeep.body.referenceCode;

      // Bulk delete id1 and id2
      const bulkRes = await request(app)
        .delete('/api/admin/registrations/bulk')
        .set('Cookie', adminCookie)
        .send({ ids: [id1, id2] });

      expect(bulkRes.status).toBe(200);
      expect(bulkRes.body.success).toBe(true);
      expect(bulkRes.body.deletedCount).toBe(2);

      // Verify unselected record remains intact
      const listRes = await request(app)
        .get('/api/admin/registrations?search=' + emailKeep)
        .set('Cookie', adminCookie);

      expect(listRes.status).toBe(200);
      const matched = listRes.body.registrations.find(r => r.id === idKeep);
      expect(matched).toBeDefined();

      // Verify deleted records no longer appear
      const checkDel = await request(app)
        .get('/api/admin/registrations?search=' + id1)
        .set('Cookie', adminCookie);
      expect(checkDel.body.registrations.find(r => r.id === id1)).toBeUndefined();
    }, 15000);

    it('deletes an individual registration by ID and returns 404 for nonexistent ID', async () => {
      const ts = Date.now().toString(36);
      const email = `single_del_${ts}@test.org`;

      const reg = await request(app).post('/api/registrations').send({
        fullName: 'Single Delete',
        email,
        institution: 'Test Univ',
        teamName: 'Team Single',
        teamSize: 1,
        trackId: 'track-3',
        consent: true
      });

      expect(reg.status).toBe(201);
      const id = reg.body.referenceCode;

      // Delete by ID
      const delRes = await request(app)
        .delete(`/api/admin/registrations/${id}`)
        .set('Cookie', adminCookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.deletedCount).toBe(1);

      // Deleting again should return 404
      const secondDel = await request(app)
        .delete(`/api/admin/registrations/${id}`)
        .set('Cookie', adminCookie);

      expect(secondDel.status).toBe(404);
      expect(secondDel.body.error).toContain('not found');
    }, 15000);

    it('preserves project submissions when referencing registration is deleted (sets registration_id to NULL)', async () => {
      const ts = Date.now().toString(36);
      const email = `linked_user_${ts}@test.org`;

      // 1. Create registration
      const reg = await request(app).post('/api/registrations').send({
        fullName: 'Linked Leader',
        email,
        institution: 'Test Univ',
        teamName: 'Linked Team',
        teamSize: 2,
        trackId: 'track-2',
        consent: true
      });
      expect(reg.status).toBe(201);
      const regId = reg.body.referenceCode;

      // 2. Create submission with same email so it links registrationId
      const sub = await request(app).post('/api/submissions').send({
        projectName: 'Linked Cloud System',
        teamName: 'Linked Team',
        leaderName: 'Linked Leader',
        email,
        trackId: 'track-2',
        problemStatement: 'Problem statement text that meets the minimum length requirement',
        description: 'Project description text that meets the minimum length requirement of twenty chars',
        architectureDescription: 'Architecture description using Lambda and DynamoDB that meets length',
        repoUrl: 'https://github.com/example/linked-cloud',
        liveDemoUrl: 'https://linked-cloud.example.com',
        awsServicesUsed: ['AWS Lambda', 'Amazon DynamoDB']
      });
      expect(sub.status).toBe(201);
      const subId = sub.body.submissionId;

      // Verify submission is linked to registration
      const subDetailsBefore = await request(app)
        .get(`/api/admin/submissions/${subId}`)
        .set('Cookie', adminCookie);
      expect(subDetailsBefore.body.submission.registrationId).toBe(regId);

      // 3. Delete registration
      const delRegRes = await request(app)
        .delete(`/api/admin/registrations/${regId}`)
        .set('Cookie', adminCookie);
      expect(delRegRes.status).toBe(200);

      // 4. Verify submission STILL EXISTS safely, and registrationId is gracefully nullified
      const subDetailsAfter = await request(app)
        .get(`/api/admin/submissions/${subId}`)
        .set('Cookie', adminCookie);
      expect(subDetailsAfter.status).toBe(200);
      expect(subDetailsAfter.body.submission.id).toBe(subId);
      expect(subDetailsAfter.body.submission.registrationId).toBeNull();
    }, 15000);
  });

  describe('Selective Submission Deletion', () => {
    it('deletes selected submissions in bulk and individually, preserving unselected records', async () => {
      const ts = Date.now().toString(36);
      const sub1 = await request(app).post('/api/submissions').send({
        projectName: 'Del Sub 1',
        teamName: 'Team Alpha',
        leaderName: 'Leader Alpha',
        email: `alpha_${ts}@test.org`,
        trackId: 'track-1',
        problemStatement: 'Problem statement text that meets the minimum length requirement',
        description: 'Project description text that meets the minimum length requirement of twenty chars',
        architectureDescription: 'Architecture description using Lambda and DynamoDB that meets length',
        repoUrl: 'https://github.com/example/del-sub-1',
        liveDemoUrl: 'https://del-1.example.com',
        awsServicesUsed: ['AWS Lambda']
      });
      expect(sub1.status).toBe(201);

      const sub2 = await request(app).post('/api/submissions').send({
        projectName: 'Del Sub 2',
        teamName: 'Team Beta',
        leaderName: 'Leader Beta',
        email: `beta_${ts}@test.org`,
        trackId: 'track-2',
        problemStatement: 'Problem statement text that meets the minimum length requirement',
        description: 'Project description text that meets the minimum length requirement of twenty chars',
        architectureDescription: 'Architecture description using Lambda and DynamoDB that meets length',
        repoUrl: 'https://github.com/example/del-sub-2',
        liveDemoUrl: 'https://del-2.example.com',
        awsServicesUsed: ['Amazon S3']
      });
      expect(sub2.status).toBe(201);

      const subKeep = await request(app).post('/api/submissions').send({
        projectName: 'Keep Sub',
        teamName: 'Team Gamma',
        leaderName: 'Leader Gamma',
        email: `gamma_${ts}@test.org`,
        trackId: 'track-3',
        problemStatement: 'Problem statement text that meets the minimum length requirement',
        description: 'Project description text that meets the minimum length requirement of twenty chars',
        architectureDescription: 'Architecture description using Lambda and DynamoDB that meets length',
        repoUrl: 'https://github.com/example/keep-sub',
        liveDemoUrl: 'https://keep.example.com',
        awsServicesUsed: ['AWS Fargate']
      });
      expect(subKeep.status).toBe(201);

      const id1 = sub1.body.submissionId;
      const id2 = sub2.body.submissionId;
      const idKeep = subKeep.body.submissionId;

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(idKeep).toBeDefined();

      // Delete id1 in bulk
      const bulkRes = await request(app)
        .delete('/api/admin/submissions/bulk')
        .set('Cookie', adminCookie)
        .send({ ids: [id1] });
      expect(bulkRes.status).toBe(200);
      expect(bulkRes.body.deletedCount).toBe(1);

      // Delete id2 individually
      const singleRes = await request(app)
        .delete(`/api/admin/submissions/${id2}`)
        .set('Cookie', adminCookie);
      expect(singleRes.status).toBe(200);
      expect(singleRes.body.deletedCount).toBe(1);

      // Verify idKeep is intact
      const keepRes = await request(app)
        .get(`/api/admin/submissions/${idKeep}`)
        .set('Cookie', adminCookie);
      expect(keepRes.status).toBe(200);
      expect(keepRes.body.submission.id).toBe(idKeep);
    }, 15000);

    it('rejects batch requests exceeding maximum size with 400', async () => {
      const oversizedArray = Array.from({ length: 205 }, (_, i) => `REG-TEST-${i}`);
      const res = await request(app)
        .delete('/api/admin/registrations/bulk')
        .set('Cookie', adminCookie)
        .send({ ids: oversizedArray });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot delete more than 200 records');
    });
  });
});
