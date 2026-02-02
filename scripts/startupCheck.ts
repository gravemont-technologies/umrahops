/**
 * Startup Check Script
 * Validates environment configuration before app starts
 */

import fs from 'fs';
import path from 'path';

interface CheckResult {
  key: string;
  required: boolean;
  present: boolean;
  masked?: string;
}

const checks: CheckResult[] = [];

function checkEnv(key: string, required: boolean = false): CheckResult {
  const value = process.env[key];
  const present = !!value && value.length > 0;

  const result: CheckResult = { key, required, present };

  if (present && value && value.length > 10) {
    result.masked = value.substring(0, 6) + '...' + value.substring(value.length - 4);
  }

  return result;
}

function check() {
  console.log('\n🔍 UmrahOps Startup Check\n');

  // Supabase
  checks.push(checkEnv('VITE_SUPABASE_URL', false));
  checks.push(checkEnv('VITE_SUPABASE_ANON_KEY', false));

  // Database
  const dbPath = process.env.SQLITE_PATH || './data/umrahops.db';
  if (!fs.existsSync(dbPath)) {
    console.warn(`⚠️  Database will be created at ${dbPath}`);
  }

  // OpenAI
  const openaiKey = checkEnv('OPENAI_API_KEY', false);
  checks.push(openaiKey);
  if (!openaiKey.present) {
    console.log('ℹ️  AI running in MOCK MODE (no OpenAI key)');
  }

  // NUSUK
  checks.push(checkEnv('VITE_NUSUK_URL', false));

  const requiredMissing = checks.filter(c => c.required && !c.present);

  if (requiredMissing.length > 0 && !process.env.SKIP_STARTUP_CHECK) {
    console.error('\n❌ Required variables missing:', requiredMissing.map(c => c.key));
    process.exit(1);
  }

  console.log('✅ Startup check passed\n');
}

check();

