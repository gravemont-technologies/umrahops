// Vercel Serverless Function Entry Point (ESM)
import path from 'path';
import { fileURLToPath } from 'url';

// Import the transpiled app from dist/server/server/index.js
// Note: tsc creates a nested 'server' folder because it mirrors src structure
import app from '../dist/server/server/index.js';

export default app;
