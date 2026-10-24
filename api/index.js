import app, { initDb } from '../server/index.js';

// Pre-initialize database on serverless function container boot
initDb().catch((err) => {
  console.error('[API] Serverless container database initialization error:', err.message);
});

export default app;
