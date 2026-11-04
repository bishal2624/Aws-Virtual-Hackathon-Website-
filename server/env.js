import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve root-level .env path
const envPath = path.resolve(__dirname, '../.env');

// Never load a developer .env during automated tests. Tests must be isolated from
// real credentials and databases; the test setup file provides explicit values.
const isTestEnvironment =
  process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST) || Boolean(process.env.VITEST_WORKER_ID);

// Native Node.js 20.6+ / 24+ environment file loader
if (!isTestEnvironment && fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[ENV] Notice loading .env file:', err.message);
    }
  }
}

export const isEnvLoaded = true;
