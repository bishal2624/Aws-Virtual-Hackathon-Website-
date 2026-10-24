import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import * as db from '../../server/db.js';
import {
  setTransporterForTesting,
  generateConfirmationEmailHtml,
  generateConfirmationEmailText,
  sendParticipantConfirmation,
  notifyOrganizerOnRegistration,
  isEmailConfigured
} from '../../server/notifications.js';

describe('Automatic Registration Confirmation Email System', () => {
  let sentMails = [];
  let mockTransporter = null;

  beforeEach(() => {
    sentMails = [];
    mockTransporter = {
      sendMail: vi.fn().mockImplementation(async (mailOptions) => {
        sentMails.push(mailOptions);
        return { messageId: `mock-msg-${Date.now()}` };
      })
    };
    setTransporterForTesting(mockTransporter);
    process.env.ORGANIZER_NOTIFICATION_EMAIL = 'organizers@hacktoween.org';
    process.env.SMTP_FROM = 'Hack - To - ween <no-reply@hacktoween.org>';
  });

  afterEach(() => {
    setTransporterForTesting(null);
    delete process.env.ORGANIZER_NOTIFICATION_EMAIL;
    vi.restoreAllMocks();
  });

  describe('Template Content & Branding Verification', () => {
    const mockRecord = {
      id: 'REG-2026-TESTREF',
      fullName: 'Marie Curie',
      email: 'marie.curie@radium.org',
      institution: 'Sorbonne University',
      teamName: 'Radiation Labs',
      teamSize: 2,
      trackId: 'track-1'
    };

    it('generates the exact required plain-text content', () => {
      const text = generateConfirmationEmailText(mockRecord);
      expect(text).toContain('Hey Marie Curie,');
      expect(text).toContain("You're officially registered for Hack - To - ween!");
      expect(text).toContain('REGISTRATION DETAILS');
      expect(text).toContain('* Event: Hack - To - ween');
      expect(text).toContain('* Participant Name: Marie Curie');
      expect(text).toContain('* Registered Email: marie.curie@radium.org');
      expect(text).toContain('* Registration Reference ID: REG-2026-TESTREF');
      expect(text).toContain('* Event Format: Fully Online');
      expect(text).toContain('IMPORTANT:');
      expect(text).toContain('Please save your registration reference ID for future reference.');
      expect(text).toContain('EVENT TIMELINE');
      expect(text).toContain('* Hackathon Kickoff: October 31, 2026');
      expect(text).toContain('* Building and Final Submission Deadline: November 5, 2026, at 11:59 PM IST');
      expect(text).toContain('We look forward to seeing what you build!');
      expect(text).toContain('Happy Hacking,');
      expect(text).toContain('Team Hack - To - ween');
      expect(text).toContain('AWS Student Builder Group, IIT Jodhpur × AWS SBG GSMCOE');
    });

    it('generates HTML email matching dark Halloween theme and escapes special characters', () => {
      const xssRecord = {
        ...mockRecord,
        fullName: 'Jane <script>alert(1)</script> & Co'
      };
      const html = generateConfirmationEmailHtml(xssRecord);
      expect(html).toContain('Hack - To - ween');
      expect(html).toContain('REG-2026-TESTREF');
      expect(html).toContain('Jane &lt;script&gt;alert(1)&lt;/script&gt; &amp; Co');
      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('#07040d'); // dark Halloween background
      expect(html).toContain('#ff7518'); // orange highlight
      expect(html).toContain('Fully Online');
      expect(html).toContain('October 31, 2026');
      expect(html).toContain('November 5, 2026, at 11:59 PM IST');
    });
  });

  describe('End-to-End Registration Flow & Email Dispatch', () => {
    it('successfully registers participant, sends confirmation email with reference code, and returns emailSent: true', async () => {
      const uniqueEmail = `test_mailer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@example.com`;
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Alan Turing',
          email: uniqueEmail,
          institution: 'Cambridge',
          teamName: 'Bletchley Enigma',
          teamSize: 3,
          trackId: 'track-3',
          consent: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.emailSent).toBe(true);
      expect(res.body.referenceCode).toMatch(/^REG-2026-[A-Z0-9]+$/);

      // Verify participant confirmation email was sent
      const participantMail = sentMails.find(m => m.to === uniqueEmail.toLowerCase());
      expect(participantMail).toBeDefined();
      expect(participantMail.subject).toBe('Registration Confirmed! 🎃 Welcome to Hack - To - ween');
      expect(participantMail.text).toContain(res.body.referenceCode);
      expect(participantMail.text).toContain('Alan Turing');
      expect(participantMail.html).toContain(res.body.referenceCode);

      // Verify persistence in DB
      const record = await db.getRegistrationByEmail(uniqueEmail);
      expect(record).toBeDefined();
      expect(record.full_name || record.fullName).toBe('Alan Turing');
    });

    it('sends organizer notification alongside participant confirmation', async () => {
      const uniqueEmail = `organizer_notify_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Nikola Tesla',
          email: uniqueEmail,
          institution: 'Wardenclyffe',
          teamName: 'Alternating Current',
          teamSize: 1,
          trackId: 'track-1',
          consent: true
        });

      expect(res.status).toBe(201);

      // Allow quick async dispatch of organizer notification
      await new Promise(r => setTimeout(r, 50));

      const organizerMail = sentMails.find(m => m.to === 'organizers@hacktoween.org');
      expect(organizerMail).toBeDefined();
      expect(organizerMail.subject).toContain('New Registration: Nikola Tesla');
      expect(organizerMail.text).toContain(res.body.referenceCode);
    });

    it('does NOT send email if registration validation fails', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Invalid Entry',
          email: 'not-an-email',
          institution: 'Nowhere',
          consent: false
        });

      expect(res.status).toBe(400);
      expect(sentMails.length).toBe(0);
    });

    it('does NOT send email if database write fails', async () => {
      const saveSpy = vi.spyOn(db, 'saveRegistration').mockRejectedValueOnce(new Error('Simulated DB write fault'));
      const email = `fail_db_${Date.now()}@example.com`;

      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Failure Test',
          email,
          institution: 'Fault Institute',
          teamSize: 1,
          trackId: 'track-1',
          consent: true
        });

      expect(res.status).toBe(500);
      expect(sentMails.length).toBe(0);
      saveSpy.mockRestore();
    });

    it('does NOT send duplicate confirmation email when duplicate registration is attempted', async () => {
      const email = `duplicate_tester_${Date.now()}@example.com`;
      const payload = {
        fullName: 'Claude Shannon',
        email,
        institution: 'Bell Labs',
        teamName: 'Information Theory',
        teamSize: 1,
        trackId: 'track-2',
        consent: true
      };

      const res1 = await request(app).post('/api/registrations').send(payload);
      expect(res1.status).toBe(201);
      expect(res1.body.emailSent).toBe(true);

      const mailsAfterFirst = sentMails.length;
      expect(mailsAfterFirst).toBeGreaterThanOrEqual(1);

      // Reset recorded mails to verify duplicate attempt
      sentMails = [];

      const res2 = await request(app).post('/api/registrations').send(payload);
      expect(res2.status).toBe(409);
      expect(res2.body.error).toContain('already submitted');
      expect(sentMails.length).toBe(0);
    });

    it('gracefully handles email provider failure without corrupting saved registration', async () => {
      // Mock transporter to reject sendMail
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection timeout: 554 Relay Access Denied'));

      const email = `smtp_fail_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Resilient Builder',
          email,
          institution: 'Robust Tech',
          teamSize: 1,
          trackId: 'track-1',
          consent: true
        });

      // Crucial: Registration must STILL succeed with HTTP 201 and valid reference code
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceCode).toBeDefined();
      expect(res.body.emailSent).toBe(false);

      // Verify the registration was genuinely saved in DB
      const persisted = await db.getRegistrationByEmail(email);
      expect(persisted).toBeDefined();
      expect(persisted.full_name || persisted.fullName).toBe('Resilient Builder');
    });

    it('handles missing SMTP configuration gracefully', async () => {
      // Remove mock transporter and ensure no environment SMTP credentials
      setTransporterForTesting(null);
      const oldHost = process.env.SMTP_HOST;
      const oldUser = process.env.SMTP_USER;
      const oldPass = process.env.SMTP_PASS;
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const email = `no_smtp_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Offline SMTP Builder',
          email,
          institution: 'Local Network',
          teamSize: 1,
          trackId: 'track-1',
          consent: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.emailSent).toBe(false);
      expect(res.body.referenceCode).toBeDefined();

      // Restore env
      if (oldHost) process.env.SMTP_HOST = oldHost;
      if (oldUser) process.env.SMTP_USER = oldUser;
      if (oldPass) process.env.SMTP_PASS = oldPass;
    });

    it('maintains admin dashboard integrity for registrations with and without email delivery', async () => {
      const email = `admin_check_${Date.now()}@example.com`;
      await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Katherine Johnson',
          email,
          institution: 'NASA West Area Computers',
          teamName: 'Orbital Mechanics',
          teamSize: 2,
          trackId: 'track-1',
          consent: true
        });

      const { records } = await db.listRegistrations({ search: 'Katherine' });
      expect(records.length).toBeGreaterThanOrEqual(1);
      const match = records.find(r => (r.fullName || r.full_name) === 'Katherine Johnson');
      expect(match).toBeDefined();
      expect(match.email).toBe(email.toLowerCase());
    });
  });
});
