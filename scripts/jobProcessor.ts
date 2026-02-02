/**
 * Job Processor - Polls jobs_queue and executes pending jobs
 * Run with: npx tsx scripts/jobProcessor.ts
 */

import { db } from "../server/db";
import { jobsQueue } from "../shared/schema";
import { eq } from "drizzle-orm";
import { spawn } from 'child_process';
import path from 'path';

const POLL_INTERVAL_MS = 5000; // 5 seconds

interface JobPayload {
    groupId?: string;
    travelerCount?: number;
    [key: string]: any;
}

async function processJob(job: typeof jobsQueue.$inferSelect) {
    console.log(`[JobProcessor] Processing job ${job.id} (${job.type})`);

    const payload = job.payload as JobPayload;

    try {
        switch (job.type) {
            case 'nusuk_sync':
                await processNusukSync(job.id, payload);
                break;
            case 'message_send':
                await processMessageSend(job.id, payload);
                break;
            default:
                console.warn(`[JobProcessor] Unknown job type: ${job.type}`);
                await markJobFailed(job.id, `Unknown job type: ${job.type}`);
                return;
        }

        await markJobCompleted(job.id);
    } catch (err: any) {
        console.error(`[JobProcessor] Job ${job.id} failed:`, err.message);
        await markJobFailed(job.id, err.message);
    }
}

async function processNusukSync(jobId: string, payload: JobPayload) {
    console.log(`[NUSUK] Syncing group ${payload.groupId} (${payload.travelerCount} travelers)`);

    // Check if RPA or API mode
    const nusukUrl = process.env.VITE_NUSUK_URL;

    if (nusukUrl) {
        // API Mode - would call NUSUK API here
        console.log(`[NUSUK] Using API mode: ${nusukUrl}`);
        // Simulate API call
        await sleep(1000);
        console.log(`[NUSUK] API sync complete for group ${payload.groupId}`);
    } else {
        // RPA Mode
        console.log(`[NUSUK] Using RPA mode (no API URL configured)`);
        console.log(`[NUSUK] Launching RPA script for group ${payload.groupId}`);

        return new Promise<void>((resolve, reject) => {
            const scriptPath = path.join(process.cwd(), 'scripts', 'rpa', 'nusuk_rpa_local.ts');

            // Use tsx to run the typescript file directly
            const rpaProcess = spawn('npx', ['tsx', scriptPath, `--groupId=${payload.groupId}`], {
                stdio: 'inherit',
                shell: true
            });

            rpaProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`[NUSUK] RPA script completed successfully`);
                    resolve();
                } else {
                    console.error(`[NUSUK] RPA script exited with code ${code}`);
                    reject(new Error(`RPA script exited with code ${code}`));
                }
            });

            rpaProcess.on('error', (err) => {
                console.error(`[NUSUK] Failed to start RPA script:`, err);
                reject(err);
            });
        });
    }
}

async function processMessageSend(jobId: string, payload: JobPayload) {
    console.log(`[Messaging] Sending message to traveler ${payload.travelerId}`);
    // In production, this would integrate with WhatsApp Business API
    await sleep(500);
    console.log(`[Messaging] Message queued for delivery`);
}

async function markJobCompleted(jobId: string) {
    await db.update(jobsQueue)
        .set({ status: 'completed', result: { completedAt: new Date().toISOString() } })
        .where(eq(jobsQueue.id, jobId));
    console.log(`[JobProcessor] Job ${jobId} marked completed`);
}

async function markJobFailed(jobId: string, error: string) {
    await db.update(jobsQueue)
        .set({ status: 'failed', result: { error, failedAt: new Date().toISOString() } })
        .where(eq(jobsQueue.id, jobId));
    console.log(`[JobProcessor] Job ${jobId} marked failed: ${error}`);
}

async function markJobProcessing(jobId: string) {
    await db.update(jobsQueue)
        .set({ status: 'processing' })
        .where(eq(jobsQueue.id, jobId));
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollJobs() {
    // Get pending jobs
    const pendingJobs = await db.select()
        .from(jobsQueue)
        .where(eq(jobsQueue.status, 'pending'))
        .limit(5);

    if (pendingJobs.length === 0) {
        return;
    }

    console.log(`[JobProcessor] Found ${pendingJobs.length} pending job(s)`);

    for (const job of pendingJobs) {
        await markJobProcessing(job.id);
        await processJob(job);
    }
}

async function main() {
    console.log('[JobProcessor] Starting job processor...');
    console.log(`[JobProcessor] Polling every ${POLL_INTERVAL_MS / 1000}s`);

    // Initial poll
    await pollJobs();

    // Continuous polling
    setInterval(async () => {
        try {
            await pollJobs();
        } catch (err) {
            console.error('[JobProcessor] Poll error:', err);
        }
    }, POLL_INTERVAL_MS);
}

main().catch(console.error);
