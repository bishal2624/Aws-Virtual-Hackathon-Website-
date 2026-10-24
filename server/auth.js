import crypto from 'crypto';

// In-memory active session tokens set with expiry timestamps
const activeSessions = new Map();
// In-memory revoked session IDs set for immediate invalidation on logout
const revokedSessions = new Set();

/**
 * Gets secret key for HMAC signing from environment variables.
 */
function getSessionSecret() {
  return process.env.SESSION_SECRET || 'hack_to_ween_dev_session_secret_2026_victorian_mansion';
}

/**
 * Gets configured admin credentials from environment.
 * Default credentials available only for local development/testing.
 */
export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || 'organizer';
  const password = process.env.ADMIN_PASSWORD || 'HackToWeen2026!Organizer';
  return { username, password };
}

/**
 * Derives cryptographic key using scrypt for password verification.
 */
function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, 64);
}

/**
 * Verifies credentials safely using constant-time comparison to prevent timing attacks.
 */
export function verifyAdminCredentials(inputUsername, inputPassword) {
  if (!inputUsername || !inputPassword) return false;

  const { username: configuredUsername, password: configuredPassword } = getAdminCredentials();

  // Username constant-time comparison
  const inputUserBuf = Buffer.from(String(inputUsername).trim());
  const configUserBuf = Buffer.from(String(configuredUsername).trim());
  if (inputUserBuf.length !== configUserBuf.length) return false;
  if (!crypto.timingSafeEqual(inputUserBuf, configUserBuf)) return false;

  // Password constant-time comparison
  const salt = 'hack_to_ween_organizer_salt_2026';
  const inputHash = deriveKey(String(inputPassword), salt);
  const targetHash = deriveKey(String(configuredPassword), salt);

  return crypto.timingSafeEqual(inputHash, targetHash);
}

/**
 * Creates a signed session token for an authenticated organizer.
 */
export function createSession(username) {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8-hour session lifetime

  const payload = JSON.stringify({ sessionId, username, expiresAt });
  const payloadBase64 = Buffer.from(payload).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadBase64)
    .digest('base64url');

  const token = `${payloadBase64}.${signature}`;

  // Store in active sessions map
  activeSessions.set(sessionId, { username, expiresAt });
  revokedSessions.delete(sessionId);

  return { token, sessionId, expiresAt };
}

/**
 * Validates a session token. Returns session details if valid, null otherwise.
 */
export function validateSession(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadBase64)
    .digest('base64url');

  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const data = JSON.parse(payloadJson);

    // Check expiration
    if (!data.expiresAt || Date.now() > data.expiresAt) {
      if (data.sessionId) activeSessions.delete(data.sessionId);
      return null;
    }

    // Check revocation in revoked sessions store
    if (data.sessionId && revokedSessions.has(data.sessionId)) {
      return null;
    }

    return { username: data.username, sessionId: data.sessionId, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

/**
 * Revokes a session token immediately on logout.
 */
export function revokeSession(token) {
  if (!token || typeof token !== 'string') return;
  try {
    const [payloadBase64] = token.split('.');
    if (!payloadBase64) return;
    const data = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (data.sessionId) {
      revokedSessions.add(data.sessionId);
      activeSessions.delete(data.sessionId);
    }
  } catch {}
}

/**
 * Express middleware to guard organizer admin routes.
 * Inspects both secure cookies and Authorization: Bearer headers.
 */
export function requireAdminAuth(req, res, next) {
  const cookieToken = req.cookies?.hack_admin_session;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Organizer credentials required to access this chamber.'
    });
  }

  const session = validateSession(token);
  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized: Session invalid or expired. Please log in again.'
    });
  }

  req.adminSession = session;
  req.adminToken = token;
  next();
}

/**
 * Standard cookie configuration helper for organizer sessions.
 */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  };
}
