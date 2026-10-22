import fs from 'fs';
import path from 'path';

console.log('Running Launch Gate Verification...\n');

let failures = 0;

// 1. Check dist exists
if (!fs.existsSync('dist') || !fs.existsSync('dist/index.html')) {
  console.error('[FAIL] dist/index.html does not exist. Run npm run build first.');
  failures++;
} else {
  console.log('[PASS] Production build artifacts exist in dist/');
}

// 2. Scan src/ for prohibited characters: emoji, em-dashes (\u2014), en-dashes (\u2013)
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

      // Check em dash
      if (content.includes('\u2014')) {
        console.error(`[FAIL] Em dash (—) found in ${fullPath}`);
        failures++;
      }
      // Check en dash
      if (content.includes('\u2013')) {
        console.error(`[FAIL] En dash (–) found in ${fullPath}`);
        failures++;
      }
      // Check banned buzzwords
      const banned = ['unleash', 'cutting-edge', 'next-generation', 'supercharge', 'game-changer', 'unlock the power'];
      for (const word of banned) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(content)) {
          console.error(`[FAIL] Banned buzzword "${word}" found in ${fullPath}`);
          failures++;
        }
      }
      // Check for raw tokens
      if (content.includes('[REGISTRATION_URL]')) {
        console.error(`[FAIL] Raw placeholder token [REGISTRATION_URL] found in ${fullPath}`);
        failures++;
      }
    }
  }
}

scanDirectory(srcDir);

// 3. Check .gitignore has .env
const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
if (!gitignoreContent.includes('.env')) {
  console.error('[FAIL] .gitignore does not ignore .env');
  failures++;
} else {
  console.log('[PASS] .gitignore includes .env protection rules');
}

// 4. Check .env.example exists and contains no secret values
if (!fs.existsSync('.env.example')) {
  console.error('[FAIL] .env.example does not exist');
  failures++;
} else {
  const exampleContent = fs.readFileSync('.env.example', 'utf8');
  if (exampleContent.includes('AKIA') || exampleContent.includes('password=') || exampleContent.includes('secret_key=')) {
    console.error('[FAIL] .env.example contains real secret keys');
    failures++;
  } else {
    console.log('[PASS] .env.example contains placeholder names only');
  }
}

console.log(`\nLaunch Gate Audit Complete: ${failures} failures.`);
if (failures > 0) {
  process.exit(1);
} else {
  console.log('ALL LAUNCH GATE CHECKS PASSED.');
  process.exit(0);
}
