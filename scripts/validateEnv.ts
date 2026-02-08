import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const REQUIRED_VARS = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'SQLITE_PATH'
];

const OPTIONAL_VARS = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'OPENAI_MODEL'
];

function validateEnv() {
    console.log('🔍 Validating environment variables...');
    let hasError = false;

    // Check .gitignore for .env
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignore.includes('.env')) {
            console.warn('⚠️  WARNING: .env is not in .gitignore. This is a security risk!');
        } else {
            console.log('✅ .env is safely in .gitignore');
        }
    }

    // Check required vars
    for (const v of REQUIRED_VARS) {
        if (!process.env[v]) {
            console.error(`❌ MISSING REQUIRED VAR: ${v}`);
            hasError = true;
        } else {
            console.log(`✅ ${v} is set`);
        }
    }

    // Check optional vars
    for (const v of OPTIONAL_VARS) {
        if (!process.env[v]) {
            console.warn(`ℹ️  Optional var ${v} is missing (running in mock/limited mode)`);
        } else {
            // Basic sanity check for keys
            const val = process.env[v] || '';
            if (v.includes('KEY') && val.length < 20) {
                console.warn(`⚠️  WARNING: ${v} looks suspiciously short (${val.length} chars)`);
            }
            console.log(`✅ ${v} is set`);
        }
    }

    if (hasError) {
        console.error('\n❌ Validation failed. Please fix the missing required variables.');
        process.exit(1);
    } else {
        console.log('\n✨ Environment validation passed!');
    }
}

validateEnv();
