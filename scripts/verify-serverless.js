import supertest from 'supertest';

process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';

console.log('[TEST] Importing api/index.js with NODE_ENV=production and VERCEL=1...');

const { default: serverlessApp } = await import('../api/index.js');

console.log('[TEST] Serverless entry point imported successfully!');

const request = supertest(serverlessApp);

// 1. Test /api/health
console.log('\n--- Checking GET /api/health ---');
const healthRes = await request.get('/api/health');
console.log('Status:', healthRes.status);
console.log('Body:', JSON.stringify(healthRes.body, null, 2));

if (healthRes.status !== 200) {
  console.error('[FAIL] Expected status 200 from /api/health, got:', healthRes.status);
  process.exit(1);
}

if (healthRes.body.database !== 'connected') {
  console.error('[FAIL] Expected database to be "connected", got:', healthRes.body.database);
  process.exit(1);
}

console.log('[PASS] /api/health is healthy and database is connected!');

// 2. Test /api/config
console.log('\n--- Checking GET /api/config ---');
const configRes = await request.get('/api/config');
console.log('Status:', configRes.status);
console.log('Body:', JSON.stringify(configRes.body, null, 2));

if (configRes.status !== 200) {
  console.error('[FAIL] Expected status 200 from /api/config, got:', configRes.status);
  process.exit(1);
}
console.log('[PASS] /api/config responded successfully!');

// 3. Test 404 handler for unmatched /api routes
console.log('\n--- Checking GET /api/unmatched-endpoint ---');
const notFoundRes = await request.get('/api/unmatched-endpoint');
console.log('Status:', notFoundRes.status);
console.log('Body:', JSON.stringify(notFoundRes.body, null, 2));

if (notFoundRes.status !== 404 || notFoundRes.body.error !== 'API endpoint not found') {
  console.error('[FAIL] Expected 404 with "API endpoint not found", got:', notFoundRes.status, notFoundRes.body);
  process.exit(1);
}
console.log('[PASS] 404 handler works as expected!');

// 4. Test proxy header handling (x-forwarded-uri)
console.log('\n--- Checking GET with x-forwarded-uri header ---');
const proxyRes = await request.get('/api/index.js').set('x-forwarded-uri', '/api/health');
console.log('Status:', proxyRes.status);
console.log('Body:', JSON.stringify(proxyRes.body, null, 2));

if (proxyRes.status !== 200 || proxyRes.body.status !== 'healthy') {
  console.error('[FAIL] Proxy header normalization failed');
  process.exit(1);
}
console.log('[PASS] Proxy header normalization verified!');

console.log('\nALL SERVERLESS INTEGRATION CHECKS PASSED SUCCESSFULLY!');
process.exit(0);
