import fs from 'fs';
import path from 'path';

console.log('Running Launch Gate Verification...\n');

let failures = 0;

function fail(message) {
  console.error(`[FAIL] ${message}`);
  failures++;
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

// 1. Production build artifacts
if (!fs.existsSync('dist') || !fs.existsSync('dist/index.html')) {
  fail('dist/index.html does not exist. Run npm run build first.');
} else {
  pass('Production build artifacts exist in dist/');
}

// 2. Scan src/ for prohibited characters and placeholder tokens
const srcDir = 'src';
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (/\.(jsx?|css|html)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      if (content.includes('\u2014')) fail(`Em dash found in ${fullPath}`);
      if (content.includes('\u2013')) fail(`En dash found in ${fullPath}`);

      const banned = ['unleash', 'cutting-edge', 'next-generation', 'supercharge', 'game-changer', 'unlock the power'];
      for (const word of banned) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(content)) {
          fail(`Banned buzzword "${word}" found in ${fullPath}`);
        }
      }

      if (content.includes('[REGISTRATION_URL]')) {
        fail(`Raw placeholder token [REGISTRATION_URL] found in ${fullPath}`);
      }
    }
  }
}
scanDirectory(srcDir);

// 3. Environment protection
if (!fs.existsSync('.gitignore')) {
  fail('.gitignore does not exist');
} else {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  if (!/^\.env$/m.test(gitignoreContent)) {
    fail('.gitignore does not ignore .env');
  } else {
    pass('.gitignore includes .env protection rules');
  }
}

// 4. Example environment file must be placeholders only and document required settings
if (!fs.existsSync('.env.example')) {
  fail('.env.example does not exist');
} else {
  const exampleContent = fs.readFileSync('.env.example', 'utf8');
  if (exampleContent.includes('AKIA') || /password=\S+/.test(exampleContent) || exampleContent.includes('secret_key=')) {
    fail('.env.example contains real secret keys');
  } else {
    pass('.env.example contains placeholder names only');
  }

  const requiredKeys = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'ALLOWED_ORIGINS',
    'PUBLIC_SITE_URL'
  ];
  for (const key of requiredKeys) {
    if (!new RegExp(`^${key}=`, 'm').test(exampleContent)) {
      fail(`.env.example does not document ${key}`);
    }
  }
}

// 5. Deployment entry points and configuration
for (const requiredFile of ['index.html', 'vercel.json', 'api/index.js', 'server/index.js', 'server/auth.js']) {
  if (!fs.existsSync(requiredFile)) {
    fail(`Required deployment file is missing: ${requiredFile}`);
  }
}

if (fs.existsSync('vercel.json')) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (!Array.isArray(vercelConfig.rewrites) || vercelConfig.rewrites.length === 0) {
      fail('vercel.json does not define API rewrites');
    } else {
      pass('vercel.json is valid and defines rewrites');
    }
  } catch (err) {
    fail(`vercel.json is not valid JSON: ${err.message}`);
  }
}

// 6. Runtime engine must support node:sqlite (Node 22.5+)
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const engine = pkg.engines?.node || '';
  if (!engine || !engine.includes('22')) {
    fail(`package.json engines.node must require Node 22.5+ for node:sqlite (found "${engine || 'none'}")`);
  } else {
    pass(`package.json declares a compatible Node engine (${engine})`);
  }
}

// 7. Removed legacy media must not be referenced
if (fs.existsSync('src')) {
  const mediaConfig = fs.readFileSync(path.join('src', 'config', 'media.js'), 'utf8');
  if (mediaConfig.includes('joker-background')) {
    fail('src/config/media.js still references the removed Joker background asset');
  }
}

console.log(`\nLaunch Gate Audit Complete: ${failures} failures.`);
if (failures > 0) {
  process.exit(1);
} else {
  console.log('ALL LAUNCH GATE CHECKS PASSED.');
  process.exit(0);
}
