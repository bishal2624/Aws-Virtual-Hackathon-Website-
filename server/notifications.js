import './env.js';
import nodemailer from 'nodemailer';

let transporter = null;
let customTransporter = null;

/**
 * Normalizes email addresses by stripping markdown link formatting (e.g. [user](mailto:email))
 * and ensuring standard RFC 5322 sender/recipient formatting.
 */
export function normalizeEmailAddress(addr) {
  if (!addr) return '';
  let str = String(addr).trim();
  // Strip markdown [display](mailto:email) or [email](mailto:email)
  const mailtoMatch = str.match(/\[(.*?)\]\(mailto:(.*?)\)/);
  if (mailtoMatch) {
    const rawDisplay = str.replace(/\[(.*?)\]\(mailto:(.*?)\)/, '').trim() || mailtoMatch[1];
    const email = mailtoMatch[2].trim();
    if (rawDisplay && rawDisplay !== email) {
      return `"${rawDisplay.replace(/"/g, '')}" <${email}>`;
    }
    return email;
  }
  // Remove wrapping quotes if present
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Safely verifies SMTP connection and authentication with the remote server.
 * Never exposes passwords or sensitive credentials.
 */
export async function verifySmtpConnection() {
  const transport = getTransporter();
  if (!transport) {
    return {
      ok: false,
      error: 'SMTP transporter not configured. Ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set in .env'
    };
  }
  try {
    await transport.verify();
    return {
      ok: true,
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Clears cached transporter instance to allow reloading configuration dynamically.
 */
export function clearTransporterCache() {
  transporter = null;
}

/**
 * Escapes HTML characters to prevent XSS in HTML email templates.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Overrides or resets the active transporter for testing purposes.
 */
export function setTransporterForTesting(mock) {
  customTransporter = mock;
}

/**
 * Initializes nodemailer transport if credentials exist in environment variables.
 */
function getTransporter() {
  if (customTransporter) return customTransporter;
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = normalizeEmailAddress(process.env.SMTP_USER);
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';

  if (host && user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      return transporter;
    } catch (err) {
      console.warn('[NOTIFICATIONS] Failed to initialize SMTP transporter:', err.message);
      return null;
    }
  }

  return null;
}

/**
 * Checks whether an email service is actively configured.
 */
export function isEmailConfigured() {
  if (customTransporter) return true;
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Generates the plain-text participant confirmation email body.
 */
export function generateConfirmationEmailText(record) {
  const name = record.fullName || 'Builder';
  const email = record.email || '';
  const refId = record.id || '';

  return [
    `Hey ${name},`,
    '',
    `You're officially registered for Hack - To - ween!`,
    '',
    `Your registration has been successfully received. Get ready to build something extraordinary in this Halloween-themed virtual hackathon.`,
    '',
    `REGISTRATION DETAILS`,
    '',
    `* Event: Hack - To - ween`,
    `* Participant Name: ${name}`,
    `* Registered Email: ${email}`,
    `* Registration Reference ID: ${refId}`,
    `* Event Format: Fully Online`,
    '',
    `IMPORTANT:`,
    `Please save your registration reference ID for future reference.`,
    '',
    `EVENT TIMELINE`,
    '',
    `* Hackathon Kickoff: October 31, 2026`,
    `* Building and Final Submission Deadline: November 5, 2026, at 11:59 PM IST`,
    '',
    `We look forward to seeing what you build!`,
    '',
    `Happy Hacking,`,
    `Team Hack - To - ween`,
    `AWS Student Builder Group, IIT Jodhpur × AWS SBG GSMCOE`
  ].join('\n');
}

/**
 * Generates the Halloween-themed HTML participant confirmation email.
 */
export function generateConfirmationEmailHtml(record) {
  const name = escapeHtml(record.fullName || 'Builder');
  const email = escapeHtml(record.email || '');
  const refId = escapeHtml(record.id || '');
  const teamName = record.teamName ? escapeHtml(record.teamName) : 'Individual Builder';
  const trackId = record.trackId ? escapeHtml(record.trackId) : 'Open Track';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - Hack - To - ween</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07040d;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f1eb;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 12px !important;
      }
      .email-card {
        padding: 20px 16px !important;
      }
      .ref-code {
        font-size: 18px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #07040d;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07040d; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #120b22; border: 1px solid rgba(255, 117, 24, 0.4); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);">

          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b0e35 0%, #0d061a 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #ff7518;">
              <div style="font-size: 13px; font-weight: 700; letter-spacing: 2.5px; color: #ff7518; text-transform: uppercase; margin-bottom: 6px;">
                AWS Virtual Hackathon 2026
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-shadow: 0 0 20px rgba(255, 117, 24, 0.6);">
                Hack - To - ween
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #a59fc4; letter-spacing: 0.5px;">
                AWS Student Builder Group, IIT Jodhpur &times; AWS SBG GSMCOE
              </p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="email-card" style="padding: 32px 28px;">
              <p style="font-size: 17px; color: #f4f1eb; margin: 0 0 16px 0;">
                Hey <strong style="color: #ff7518;">${name}</strong>,
              </p>
              <p style="font-size: 15px; color: #d4cfdf; line-height: 1.6; margin: 0 0 14px 0;">
                You're officially registered for <strong>Hack - To - ween</strong>!
              </p>
              <p style="font-size: 14px; color: #a59fc4; line-height: 1.6; margin: 0 0 26px 0;">
                Your registration has been successfully received. Get ready to build something extraordinary in this Halloween-themed virtual hackathon.
              </p>

              <!-- Reference ID Highlight Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090412; border: 1px solid #ff7518; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #ff7518; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                      Official Registration Reference ID
                    </div>
                    <div class="ref-code" style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 800; color: #a3ff12; letter-spacing: 2px;">
                      ${refId}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Registration Details Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a1030; border: 1px solid rgba(255, 117, 24, 0.2); border-radius: 8px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #ff7518; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 117, 24, 0.2); padding-bottom: 6px;">
                      REGISTRATION DETAILS
                    </div>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.8; color: #d4cfdf;">
                      <tr>
                        <td width="38%" style="color: #8e88aa;">&bull; Event:</td>
                        <td style="color: #ffffff; font-weight: 600;">Hack - To - ween</td>
                      </tr>
                      <tr>
                        <td style="color: #8e88aa;">&bull; Participant Name:</td>
                        <td style="color: #ffffff; font-weight: 600;">${name}</td>
                      </tr>
                      <tr>
                        <td style="color: #8e88aa;">&bull; Registered Email:</td>
                        <td style="color: #ffffff;">${email}</td>
                      </tr>
                      <tr>
                        <td style="color: #8e88aa;">&bull; Team / Designation:</td>
                        <td style="color: #ffffff;">${teamName}</td>
                      </tr>
                      <tr>
                        <td style="color: #8e88aa;">&bull; Challenge Track:</td>
                        <td style="color: #ffffff;">${trackId}</td>
                      </tr>
                      <tr>
                        <td style="color: #8e88aa;">&bull; Event Format:</td>
                        <td style="color: #a3ff12; font-weight: 600;">Fully Online</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Alert Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 117, 24, 0.08); border-left: 4px solid #ff7518; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #f4f1eb; line-height: 1.5;">
                    <strong style="color: #ff7518;">IMPORTANT:</strong> Please save your registration reference ID for future reference.
                  </td>
                </tr>
              </table>

              <!-- Event Timeline Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a1030; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 8px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #a78bfa; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(139, 92, 246, 0.2); padding-bottom: 6px;">
                      EVENT TIMELINE
                    </div>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.8; color: #d4cfdf;">
                      <tr>
                        <td width="42%" style="color: #8e88aa;">&bull; Hackathon Kickoff:</td>
                        <td style="color: #ffffff; font-weight: 600;">October 31, 2026</td>
                      </tr>
                      <tr>
                        <td style="color: #8e88aa;">&bull; Final Submission Deadline:</td>
                        <td style="color: #ff7518; font-weight: 600;">November 5, 2026, at 11:59 PM IST</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 15px; color: #f4f1eb; margin: 0 0 16px 0;">
                We look forward to seeing what you build!
              </p>

              <div style="font-size: 14px; color: #d4cfdf; line-height: 1.6; margin: 0;">
                Happy Hacking,<br>
                <strong style="color: #ff7518; font-size: 15px;">Team Hack - To - ween</strong><br>
                <span style="font-size: 12px; color: #8e88aa;">AWS Student Builder Group, IIT Jodhpur &times; AWS SBG GSMCOE</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0c0717; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0; font-size: 11px; color: #736b8c; line-height: 1.5;">
                This is an automated notification from Hack - To - ween.<br>
                Please keep this email for your records regarding project submission.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a notification email to the organizing team when a new participant registers.
 * Non-blocking: failures will never reject the registration or throw to the caller.
 */
export async function notifyOrganizerOnRegistration(record) {
  try {
    const transport = getTransporter();
    const rawOrganizer = process.env.ORGANIZER_NOTIFICATION_EMAIL || process.env.ORGANIZER_EMAIL;
    const organizerEmail = normalizeEmailAddress(rawOrganizer);

    if (!transport || !organizerEmail) {
      if (process.env.NODE_ENV !== 'test') {
        console.log('[NOTIFICATIONS] Organizer email skipped: SMTP credentials or ORGANIZER_NOTIFICATION_EMAIL not configured.');
      }
      return { sent: false, reason: 'unconfigured' };
    }

    const rawFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Hack - To - ween <no-reply@hacktoween.org>';
    const fromAddress = normalizeEmailAddress(rawFrom);
    const subject = `[Hack - To - ween] New Registration: ${record.fullName} (${record.id})`;
    const textBody = `
New Participant Registration Recorded:

Reference Code: ${record.id}
Full Name: ${record.fullName}
Email: ${record.email}
Institution: ${record.institution}
Team Name: ${record.teamName || 'Individual Builder'}
Team Size: ${record.teamSize}
Track: ${record.trackId}
Registered At: ${record.registeredAt || new Date().toISOString()}

Access organizer dashboard at: ${process.env.PUBLIC_SITE_URL || 'http://localhost:5173'}/admin
    `.trim();

    await transport.sendMail({
      from: fromAddress,
      to: organizerEmail,
      subject,
      text: textBody
    });

    console.log(`[NOTIFICATIONS] Organizer notification sent for reference code ${record.id}`);
    return { sent: true };
  } catch (err) {
    console.error('[NOTIFICATIONS] Failed to deliver organizer notification:', err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Sends a confirmation email to the participant with their official reference code.
 * Safe and non-blocking: failures will never corrupt the database or reject the registration.
 */
export async function sendParticipantConfirmation(record) {
  try {
    const transport = getTransporter();
    if (!transport) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[NOTIFICATIONS] Participant confirmation email skipped: SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured.');
      }
      return { sent: false, reason: 'unconfigured' };
    }

    const rawFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Hack - To - ween <no-reply@hacktoween.org>';
    const fromAddress = normalizeEmailAddress(rawFrom);
    const subject = 'Registration Confirmed! 🎃 Welcome to Hack - To - ween';
    const text = generateConfirmationEmailText(record);
    const html = generateConfirmationEmailHtml(record);

    await transport.sendMail({
      from: fromAddress,
      to: record.email,
      subject,
      text,
      html
    });

    console.log(`[NOTIFICATIONS] Participant confirmation email successfully sent to ${record.email} (Ref: ${record.id})`);
    return { sent: true };
  } catch (err) {
    console.error(`[NOTIFICATIONS] Failed to send participant confirmation email to ${record.email}:`, err.message);
    return { sent: false, error: err.message };
  }
}
