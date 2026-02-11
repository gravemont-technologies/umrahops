// @ts-nocheck
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "../shared/schema.js";
import path from 'path';
import fs from 'fs';

let dbExport;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL for Production (Railway/Render)
  console.log("DB: Initializing PostgreSQL pool...");

  // Surgical fix: Encode password brackets if present to prevent URI parsing errors
  let connectionString = process.env.DATABASE_URL;
  if (connectionString.includes('[') || connectionString.includes(']')) {
    try {
      const url = new URL(connectionString);
      url.password = encodeURIComponent(url.password);
      connectionString = url.toString();
    } catch (e) {
      console.warn("DB: Failed to parse/auto-encode DATABASE_URL. Proceeding with raw string.");
    }
  }

  const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false
  });

  // Test connection immediately to catch host errors early
  pool.on('error', (err) => {
    if (err.message.includes('ENOTFOUND')) {
      console.error("DB CRITICAL: Host resolution failed. If using Supabase, your project might be PAUSED. Please resume it in the dashboard.");
    } else {
      console.error("DB Pool Error:", err.message);
    }
  });

  dbExport = drizzlePg(pool, { schema });
  console.log("DB: PostgreSQL connection configuration ready.");
} else {
  // Use SQLite for Local Development
  console.log("DB: No DATABASE_URL found. Using SQLite fallback.");
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.log(`DB: Creating directory ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlitePath = process.env.SQLITE_PATH || path.join(dataDir, 'umrahops.db');
  console.log(`DB: Opening SQLite database at ${sqlitePath}`);
  const sqlite = new Database(sqlitePath);

  // Enable WAL mode for performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 30000');

  dbExport = drizzleSqlite(sqlite, { schema });
  console.log("DB: SQLite connection ready.");
}

export const db = dbExport;
