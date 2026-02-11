import "dotenv/config";
import pg from 'pg';

async function testConnection() {
    console.log("Testing Supabase connection...");
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
        console.log("DATABASE_URL preview:", process.env.DATABASE_URL.substring(0, 20) + "...");
    }

    if (!process.env.DATABASE_URL) {
        console.error("No DATABASE_URL found!");
        return;
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log("Connection successful! Time from DB:", res.rows[0]);
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        await pool.end();
    }
}

testConnection();
