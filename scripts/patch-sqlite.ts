import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'umrahops.db');
const db = new Database(dbPath);

console.log(`Manually patching SQLite database at ${dbPath}...`);

try {
    // Check if columns exist and add them if they don't
    const tableInfo = db.prepare("PRAGMA table_info(travelers)").all();
    const columns = tableInfo.map(c => c.name);

    const missingColumns = [
        { name: 'phone', type: 'TEXT' },
        { name: 'arrival_date', type: 'TEXT' },
        { name: 'departure_date', type: 'TEXT' },
        { name: 'flight_number', type: 'TEXT' }
    ];

    for (const col of missingColumns) {
        if (!columns.includes(col.name)) {
            console.log(`Adding column ${col.name}...`);
            db.prepare(`ALTER TABLE travelers ADD COLUMN ${col.name} ${col.type}`).run();
        } else {
            console.log(`Column ${col.name} already exists.`);
        }
    }

    console.log("SQLite patch successful!");
} catch (err) {
    console.error("Patch failed:", err);
} finally {
    db.close();
}
