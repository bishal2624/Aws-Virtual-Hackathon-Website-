import { z } from 'zod';

// Detect AWS Access Key IDs or Private Key blocks
const AWS_KEY_REGEX = /AKIA[0-9A-Z]{16}/;
const PRIVATE_KEY_REGEX = /-----BEGIN[ A-Z0-9_-]+KEY-----/;

function containsSecrets(val) {
  if (typeof val !== 'string') return false;
  return AWS_KEY_REGEX.test(val) || PRIVATE_KEY_REGEX.test(val);
}

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
  trackId: z.string().trim().default('track-1'),
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
  trackId: z.string().trim().min(1, 'Challenge track is required'),
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
