import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import * as db from '../../server/db.js';
import { getAdminCredentials } from '../../server/auth.js';

describe('Organizer Authentication & Registration Management API', () => {
  const { username, password } = getAdminCredentials();

  beforeEach(async () => {
    // Ensure database is initialized
    await db.initDb();
  });

  describe('Security & Unauthorized Access', () => {
    it('rejects unauthenticated requests to /api/admin/registrations with 401', async () => {
      const res = await request(app).get('/api/admin/registrations');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Organizer credentials required');
    });

    it('rejects unauthenticated requests to /api/admin/registrations/export.csv with 401', async () => {
      const res = await request(app).get('/api/admin/registrations/export.csv');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Organizer credentials required');
    });

    it('rejects unauthenticated requests to /api/admin/me with 401', async () => {
      const res = await request(app).get('/api/admin/me');
      expect(res.status).toBe(401);
    });

    it('rejects login with invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ username: 'invalid_user', password: 'wrong_password' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid organizer credentials');
    });

    it('rejects login with empty fields with 400', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ username: '', password: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('Authentication Flow & Session Lifecycle', () => {
    it('successfully authenticates organizer and returns token and cookie', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ username, password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe(username);

      const cookieHeader = res.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader.some(c => c.includes('hack_admin_session'))).toBe(true);
    });

    it('allows access to /api/admin/me using session cookie', async () => {
      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({ username, password });

      const cookie = loginRes.headers['set-cookie'];

      const meRes = await request(app)
        .get('/api/admin/me')
        .set('Cookie', cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.authenticated).toBe(true);
      expect(meRes.body.user.username).toBe(username);
    });

    it('allows access to /api/admin/me using Bearer token header', async () => {
      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({ username, password });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/admin/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.authenticated).toBe(true);
    });

    it('revokes session on logout, rejecting subsequent requests with 401', async () => {
      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({ username, password });

      const cookie = loginRes.headers['set-cookie'];
      const token = loginRes.body.token;

      // Verify authenticated
      const beforeRes = await request(app)
        .get('/api/admin/me')
        .set('Cookie', cookie);
      expect(beforeRes.status).toBe(200);

      // Perform logout
      const logoutRes = await request(app)
        .post('/api/admin/logout')
        .set('Cookie', cookie);
      expect(logoutRes.status).toBe(200);

      // Subsequent request with the same cookie/token must be rejected
      const afterRes = await request(app)
        .get('/api/admin/me')
        .set('Authorization', `Bearer ${token}`);
      expect(afterRes.status).toBe(401);
    });
  });

  describe('Registration Listing, Search, Filter & Metrics', () => {
    let authCookie;

    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({ username, password });
      authCookie = loginRes.headers['set-cookie'];

      // Seed synthetic registrations for search & filter tests
      await db.saveRegistration({
        id: 'REG-2026-SEEDA1',
        fullName: 'Nikola Tesla',
        email: 'tesla@wardenclyffe.org',
        institution: 'Colorado Springs Lab',
        teamName: 'Alternating Current',
        teamSize: 2,
        trackId: 'track-1',
        consent: true,
        registeredAt: new Date().toISOString()
      }).catch(() => {});

      await db.saveRegistration({
        id: 'REG-2026-SEEDB2',
        fullName: 'Marie Curie',
        email: 'curie@sorbonne.fr',
        institution: 'Paris Institute',
        teamName: 'Radium Pioneers',
        teamSize: 1,
        trackId: 'track-2',
        consent: true,
        registeredAt: new Date().toISOString()
      }).catch(() => {});
    });

    it('lists registrations with pagination and metrics', async () => {
      const res = await request(app)
        .get('/api/admin/registrations?page=1&limit=5')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.registrations)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.metrics).toBeDefined();
      expect(res.body.metrics.total).toBeGreaterThanOrEqual(2);
    });

    it('filters registrations by search query (name or email)', async () => {
      const res = await request(app)
        .get('/api/admin/registrations?search=Tesla')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.registrations.some(r => r.fullName === 'Nikola Tesla')).toBe(true);
      expect(res.body.registrations.every(r =>
        r.fullName.includes('Tesla') || r.email.includes('Tesla') || r.id.includes('Tesla') || (r.teamName && r.teamName.includes('Tesla'))
      )).toBe(true);
    });

    it('filters registrations by challenge trackId', async () => {
      const res = await request(app)
        .get('/api/admin/registrations?trackId=track-2')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.registrations.every(r => r.trackId === 'track-2')).toBe(true);
    });

    it('exports all registrations as RFC 4180 CSV with correct headers', async () => {
      const res = await request(app)
        .get('/api/admin/registrations/export.csv')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('.csv');

      const csvText = res.text;
      expect(csvText).toContain('Reference Code');
      expect(csvText).toContain('Full Name');
      expect(csvText).toContain('Email Address');
      expect(csvText).toContain('Institution');
      expect(csvText).toContain('Nikola Tesla');
    });
  });
});
