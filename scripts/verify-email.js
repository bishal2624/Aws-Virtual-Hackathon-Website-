import '../server/env.js';
import {
  verifySmtpConnection,
  normalizeEmailAddress,
  extractPureEmail,
  getSenderAddress
} from '../server/notifications.js';

async function main() {
  console.log('Running Safe SMTP Configuration Audit & Connection Verification...\n');

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const isGmail = host?.toLowerCase().includes('gmail.com');
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || (isGmail ? 465 : 587);
  const rawUser = process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.EMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const hasPass = Boolean(rawPass);
  const passLength = rawPass ? rawPass.length : 0;
  const rawFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM;
  const effectiveSender = getSenderAddress();
  const rawOrganizer = process.env.ORGANIZER_NOTIFICATION_EMAIL || process.env.ORGANIZER_EMAIL;
  const organizerEmail = normalizeEmailAddress(rawOrganizer);

  console.log('----------------------------------------------------');
  console.log('Active SMTP Configuration (Secrets Redacted):');
  console.log('----------------------------------------------------');
  console.log('SMTP_HOST:                    ', host || '[NOT SET]');
  console.log('SMTP_PORT:                    ', port);
  const pureUser = extractPureEmail(rawUser);
  console.log('SMTP_USER (Auth Account):     ', pureUser || '[NOT SET]');
  console.log('SMTP_PASS:                    ', hasPass ? `[CONFIGURED (Length: ${passLength} chars, Secret Hidden)]` : '[NOT SET]');
  console.log('SMTP_FROM (Raw Setting):      ', rawFrom || '[DEFAULT]');
  console.log('Effective Sender (RFC 5322):  ', effectiveSender);
  console.log('ORGANIZER_NOTIFICATION_EMAIL: ', organizerEmail || '[NOT SET]');
  console.log('----------------------------------------------------\n');

  if (!host || !pureUser || !hasPass) {
    console.error('[FAIL] Incomplete SMTP credentials. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    process.exit(1);
  }

  // Resend specific checks
  if (host.includes('resend.com')) {
    console.log('[INFO] Detected Resend SMTP provider.');
    if (fromAddress.includes('resend.dev')) {
      console.log('[NOTE] Using Resend default testing domain (resend.dev).');
      console.log('       Per Resend policies, testing emails can ONLY be sent to the email address');
      console.log('       associated with your Resend account. To send to any recipient, verify your domain in Resend.');
    } else {
      console.log('[NOTE] Custom domain sender address detected. Ensure domain is verified in your Resend dashboard.');
    }
  }

  console.log('\nTesting remote SMTP handshake and authentication (no email will be sent)...');
  const result = await verifySmtpConnection();

  if (result.ok) {
    console.log(`[PASS] Successfully connected and authenticated with ${result.host}:${result.port}!`);
    console.log('[PASS] SMTP server accepted credentials. Nodemailer is ready to send confirmation emails.');
    process.exit(0);
  } else {
    console.error(`[FAIL] SMTP authentication/connection failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[ERROR] Unexpected audit error:', err.message);
  process.exit(1);
});
