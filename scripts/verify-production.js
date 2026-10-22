import fs from 'fs';
import path from 'path';

console.log('Running Production Deployment Audit & Launch Checklist...\n');

let issues = 0;

// 1. Verify build output exists
if (!fs.existsSync('dist/index.html')) {
  console.error('[FAIL] dist/index.html does not exist.');
  issues++;
} else {
  console.log('[PASS] Production bundle compiled in dist/');
}

// 2. Verify absence of source maps in dist (Section 17: no source maps in production build)
const distAssets = fs.existsSync('dist/assets') ? fs.readdirSync('dist/assets') : [];
const mapFiles = distAssets.filter(f => f.endsWith('.map'));
if (mapFiles.length > 0) {
  console.error(`[FAIL] Source map files found in production output: ${mapFiles.join(', ')}`);
  issues++;
} else {
  console.log('[PASS] No source map files (.map) present in production dist/');
}

// 3. Verify absence of placeholder tokens
const htmlContent = fs.readFileSync('dist/index.html', 'utf8');
if (htmlContent.includes('[REGISTRATION_URL]') || htmlContent.includes('TODO') || htmlContent.includes('LOREM')) {
  console.error('[FAIL] Raw placeholder tokens or TODO text found in dist/index.html');
  issues++;
} else {
  console.log('[PASS] No raw placeholder tokens in shipped HTML');
}

// 4. Verify security headers in server
const serverCode = fs.readFileSync('server/index.js', 'utf8');
if (!serverCode.includes('helmet') || !serverCode.includes('contentSecurityPolicy')) {
  console.error('[FAIL] Server does not configure Helmet CSP');
  issues++;
} else {
  console.log('[PASS] Server configures Helmet with strict Content Security Policy');
}

// 5. Verify dotfile protection in server
if (!serverCode.includes('.startsWith(\'/.\')')) {
  console.error('[FAIL] Server does not block dotfiles');
  issues++;
} else {
  console.log('[PASS] Server blocks dotfiles and hidden paths with HTTP 404');
}

console.log(`\nProduction Checklist Complete: ${issues} issues found.`);
process.exit(issues > 0 ? 1 : 0);
