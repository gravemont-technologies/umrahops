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
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  dbExport = drizzlePg(pool, { schema });
} else {
  // Use SQLite for Local Development
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlitePath = process.env.SQLITE_PATH || path.join(dataDir, 'umrahops.db');
  const sqlite = new Database(sqlitePath);

  // Enable WAL mode for performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 30000');

  dbExport = drizzleSqlite(sqlite, { schema });
}

export const db = dbExport;
