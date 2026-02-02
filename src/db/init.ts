import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, 'umrahops.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');

function init() {
  console.log('Initializing UmrahOps Database...');

  // 1. Create DB if missing
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }

  const db = new Database(DB_PATH);
  console.log(`Connected to SQLite at: ${DB_PATH}`);

  // 2. Set Pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 30000');
  console.log('Set SQLite pragmas (WAL, NORMAL, FK=ON)');

  // 3. Run Migrations
  if (fs.existsSync(MIGRATIONS_DIR)) {
    const files = fs.readdirSync(MIGRATIONS_DIR).sort();
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
        db.exec(sql);
      }
    }
  } else {
    console.warn(`No migrations found at ${MIGRATIONS_DIR}`);
  }

  console.log('Database initialization complete.');
  db.close();
}

init();
