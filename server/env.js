import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve root-level .env path
const envPath = path.resolve(__dirname, '../.env');

// Native Node.js 20.6+ / 24+ environment file loader
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[ENV] Notice loading .env file:', err.message);
    }
  }
}

export const isEnvLoaded = true;
