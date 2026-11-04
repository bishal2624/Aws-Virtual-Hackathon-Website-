import { z } from 'zod';

// Detect cloud credentials, provider API tokens, and private key blocks.
const SECRET_PATTERNS = [
  /\bAKIA[0-9A-Z]{16}\b/,                       // AWS access key ID
  /\bASIA[0-9A-Z]{16}\b/,                       // AWS temporary access key ID
  /-----BEGIN[ A-Z0-9_-]+(?:PRIVATE KEY|CERTIFICATE)-----/,
  /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,             // GitHub tokens
  /\bgithub_pat_[A-Za-z0-9_]{22,}\b/,           // GitHub fine-grained token
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,           // Slack tokens
  /\bsk-[A-Za-z0-9]{20,}\b/,                    // OpenAI-style secret keys
  /\bAIza[0-9A-Za-z_-]{35}\b/,                  // Google API keys
  /\b(?:aws_secret_access_key|secret_access_key|api[_-]?key|access[_-]?token|password|passwd)\s*[:=]\s*\S{8,}/i
];

function containsSecrets(val) {
  if (typeof val !== 'string') return false;
  return SECRET_PATTERNS.some(pattern => pattern.test(val));
}

// The only valid challenge track identifiers.
const TRACK_IDS = ['track-1', 'track-2', 'track-3', 'track-4'];
const TrackIdSchema = z.enum(TRACK_IDS, {
  errorMap: () => ({ message: `Challenge track must be one of: ${TRACK_IDS.join(', ')}` })
});

// Allowed git host domains for repository URLs
const ALLOWED_GIT_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org'];

export function isValidRepoUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_GIT_HOSTS.some(host => hostname === host || hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}

export function isValidHttpsUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    return true;
  } catch {
    return false;
  }
}

export const RegistrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  institution: z.string().trim().min(2, 'Institution must be specified').max(150),
  teamName: z.string().trim().max(100).optional().default(''),
  teamSize: z.coerce.number().int().min(1).max(4).default(1),
  trackId: TrackIdSchema.default('track-1'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to terms of participation' })
  })
}).refine(data => !containsSecrets(data.fullName) && !containsSecrets(data.institution), {
  message: 'Invalid characters or sensitive patterns detected'
});

export const SubmissionSchema = z.object({
  projectName: z.string().trim().min(2, 'Project name is required').max(120),
  teamName: z.string().trim().min(2, 'Team name is required').max(120),
  leaderName: z.string().trim().min(2, 'Leader name is required').max(100),
  email: z.string().trim().email('Invalid leader email').toLowerCase(),
  trackId: TrackIdSchema,
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  problemStatement: z.string().trim().min(10, 'Problem statement is required').max(1000),
  architectureDescription: z.string().trim().min(20, 'Architecture description must be at least 20 characters').max(2000),
  repoUrl: z.string().trim().refine(isValidRepoUrl, {
    message: 'Repository must be a valid HTTPS URL on github.com, gitlab.com, or bitbucket.org without credentials'
  }),
  liveDemoUrl: z.string().trim().refine(isValidHttpsUrl, {
    message: 'Live demo must be a valid public HTTPS URL without credentials'
  }),
  videoUrl: z.string().trim().optional().refine(val => !val || isValidHttpsUrl(val), {
    message: 'Video URL must be a valid HTTPS URL if provided'
  }),
  awsServicesUsed: z.array(z.string().trim()).min(1, 'At least one AWS service must be specified')
}).refine(data => {
  const fields = [
    data.projectName,
    data.teamName,
    data.leaderName,
    data.description,
    data.problemStatement,
    data.architectureDescription
  ];
  return !fields.some(containsSecrets);
}, {
  message: 'Cloud access keys or private key blocks are strictly prohibited in submissions'
});
