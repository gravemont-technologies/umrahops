/**
 * NUSUK RPA Local Worker (Playwright-based)
 * Processes pending NUSUK jobs from jobs_queue using Playwright automation
 * 
 * IMPORTANT: This script must run LOCALLY (not on Replit)
 * Requires: npx playwright install chromium
 * 
 * Usage:
 *   node scripts/rpa/nusuk_rpa_local.js
 *   node scripts/rpa/nusuk_rpa_local.js --groupId=<UUID>
 */

import { chromium, Browser, Page } from 'playwright';
import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// === CONFIG ===
const NUSUK_PORTAL_URL = process.env.VITE_NUSUK_URL || 'https://visa.nusuk.sa'; // Example URL
const CONCURRENCY = 3; // Max parallel browser tabs
const RATE_LIMIT_DELAY_MS = 2000; // Delay between requests
const MAX_RETRIES = 3;

// === DATABASE ===
const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'umrahops.db');
const db = new Database(dbPath);

// === TYPES ===
interface Job {
    id: string;
    type: string;
    payload: { groupId: string; travelerId?: string };
    status: string;
    attempts: number;
}

interface Traveler {
    id: string;
    passportNumber: string;
    name: string;
    nationality: string;
    dob: string;
}

// === JOB QUEUE ===
function getPendingJobs(groupId?: string): Job[] {
    const query = groupId
        ? db.prepare(`SELECT * FROM jobs_queue WHERE type = 'nusuk_sync' AND (status = 'pending' OR status = 'processing') AND json_extract(payload, '$.groupId') = ?`)
        : db.prepare(`SELECT * FROM jobs_queue WHERE type = 'nusuk_sync' AND status = 'pending' LIMIT 50`);

    const rows = groupId ? query.all(groupId) : query.all();

    return rows.map((row: any) => ({
        ...row,
        payload: JSON.parse(row.payload as string),
    })) as Job[];
}

function updateJob(jobId: string, status: string, result?: any, error?: string) {
    const stmt = db.prepare(`
    UPDATE jobs_queue 
    SET status = ?, result = ?, last_error = ?, attempts = attempts + 1
    WHERE id = ?
  `);

    stmt.run(status, result ? JSON.stringify(result) : null, error || null, jobId);
}

function getTravelersByGroup(groupId: string): Traveler[] {
    const stmt = db.prepare(`SELECT * FROM travelers WHERE group_id = ?`);
    return stmt.all(groupId) as Traveler[];
}

function updateTravelerNusukStatus(travelerId: string, nusukId: string | null, status: string) {
    const stmt = db.prepare(`
    UPDATE travelers 
    SET nusuk_id = ?, nusuk_status = ?, nusuk_last_checked = unixepoch()
    WHERE id = ?
  `);

    stmt.run(nusukId, status, travelerId);
}

// === RPA LOGIC ===
async function checkNusukStatus(page: Page, traveler: Traveler): Promise<{ nusukId: string | null; status: string }> {
    try {
        // STEP 1: Navigate to NUSUK portal
        await page.goto(NUSUK_PORTAL_URL, { waitUntil: 'networkidle' });

        // STEP 2: Fill passport number (update selector based on actual NUSUK portal)
        // Example selectors - MUST BE UPDATED based on real portal inspection
        await page.fill('input[name="passportNumber"]', traveler.passportNumber);
        await page.fill('input[name="nationality"]', traveler.nationality);
        await page.fill('input[name="dob"]', traveler.dob);

        // STEP 3: Submit form
        await page.click('button[type="submit"]');

        // STEP 4: Wait for result (update selector)
        await page.waitForSelector('.nusuk-result', { timeout: 10000 });

        // STEP 5: Scrape result
        const statusText = await page.textContent('.nusuk-status');
        const nusukId = await page.textContent('.nusuk-id');

        // Parse status (update logic based on actual response)
        let status = 'error';
        if (statusText?.includes('approved') || statusText?.includes('موافقة')) {
            status = 'approved';
        } else if (statusText?.includes('rejected') || statusText?.includes('مرفوض')) {
            status = 'rejected';
        } else if (statusText?.includes('pending') || statusText?.includes('قيد المراجعة')) {
            status = 'pending';
        }

        return { nusukId: nusukId || null, status };

    } catch (error) {
        console.error(`❌ Error checking NUSUK for traveler ${traveler.id}:`, error);
        return { nusukId: null, status: 'error' };
    }
}

async function processGroup(browser: Browser, groupId: string) {
    console.log(`\n📋 Processing group: ${groupId}`);

    const travelers = getTravelersByGroup(groupId);
    console.log(`   Found ${travelers.length} travelers`);

    for (const traveler of travelers) {
        const page = await browser.newPage();

        try {
            console.log(`   🔍 Checking NUSUK for: ${traveler.name} (${traveler.passportNumber})`);

            const result = await checkNusukStatus(page, traveler);

            updateTravelerNusukStatus(traveler.id, result.nusukId, result.status);

            console.log(`   ✅ Result: ${result.status} ${result.nusukId ? `(ID: ${result.nusukId})` : ''}`);

            // Rate limiting
            await page.waitForTimeout(RATE_LIMIT_DELAY_MS);

        } catch (error) {
            console.error(`   ❌ Failed: ${error}`);
            updateTravelerNusukStatus(traveler.id, null, 'error');
        } finally {
            await page.close();
        }
    }
}

// === MAIN ===
async function main() {
    const args = process.argv.slice(2);
    const groupIdArg = args.find(arg => arg.startsWith('--groupId='));
    const targetGroupId = groupIdArg ? groupIdArg.split('=')[1] : undefined;

    console.log('🤖 UmrahOps NUSUK RPA Worker\n');

    if (targetGroupId) {
        console.log(`🎯 Target group: ${targetGroupId}`);
    } else {
        console.log('🎯 Processing all pending NUSUK jobs');
    }

    const jobs = getPendingJobs(targetGroupId);
    console.log(`📦 Found ${jobs.length} pending jobs\n`);

    if (jobs.length === 0) {
        console.log('✅ No pending jobs. Exiting.');
        process.exit(0);
    }

    // Launch browser (headful for debugging, use headless: true for production)
    const browser = await chromium.launch({ headless: false });

    try {
        for (const job of jobs) {
            console.log(`\n🔄 Processing job: ${job.id}`);
            updateJob(job.id, 'processing');

            try {
                await processGroup(browser, job.payload.groupId);
                updateJob(job.id, 'completed', { success: true });
                console.log(`✅ Job completed: ${job.id}`);
            } catch (error: any) {
                console.error(`❌ Job failed: ${job.id}`, error);

                if (job.attempts < MAX_RETRIES) {
                    updateJob(job.id, 'pending', null, error.message);
                    console.log(`   ⚠️  Marked for retry (attempt ${job.attempts + 1}/${MAX_RETRIES})`);
                } else {
                    updateJob(job.id, 'failed', null, error.message);
                    console.log(`   ❌ Max retries exceeded`);
                }
            }
        }
    } finally {
        await browser.close();
    }

    console.log('\n✅ All jobs processed. Exiting.\n');
    process.exit(0);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
