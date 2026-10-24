import '../server/env.js';
import { verifySmtpConnection, normalizeEmailAddress } from '../server/notifications.js';

async function main() {
  console.log('Running Safe SMTP Configuration Audit & Connection Verification...\n');

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const hasPass = Boolean(process.env.SMTP_PASS);
  const passLength = process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0;
  const rawFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM;
  const fromAddress = normalizeEmailAddress(rawFrom);
  const rawOrganizer = process.env.ORGANIZER_NOTIFICATION_EMAIL || process.env.ORGANIZER_EMAIL;
  const organizerEmail = normalizeEmailAddress(rawOrganizer);

  console.log('----------------------------------------------------');
  console.log('Active SMTP Configuration (Secrets Redacted):');
  console.log('----------------------------------------------------');
  console.log('SMTP_HOST:                    ', host || '[NOT SET]');
  console.log('SMTP_PORT:                    ', port);
  const normalizedUser = normalizeEmailAddress(user);
  console.log('SMTP_USER (Normalized):       ', normalizedUser || '[NOT SET]');
  console.log('SMTP_PASS:                    ', hasPass ? `[CONFIGURED (Length: ${passLength} chars, Secret Hidden)]` : '[NOT SET]');
  console.log('SMTP_FROM (Raw):              ', rawFrom || '[NOT SET]');
  console.log('SMTP_FROM (Normalized):       ', fromAddress || '[NOT SET]');
  console.log('ORGANIZER_NOTIFICATION_EMAIL: ', organizerEmail || '[NOT SET]');
  console.log('----------------------------------------------------\n');

  if (!host || !user || !hasPass) {
    console.error('[FAIL] Incomplete SMTP credentials. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.');
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
