# Manual Local-Only Steps

This guide covers procedures that **must** run locally after downloading the UmrahOps repository. These tasks cannot run on Replit due to resource/security constraints.

---

## 1. Playwright RPA for NUSUK Automation

**Why local-only:** Headful browser automation requires stable chromium + persistent sessions; exceeds Replit limits.

### Setup

```bash
# Install Playwright with browsers
npm install -D playwright
npx playwright install chromium
```

### Running the RPA worker

```bash
# Process pending NUSUK jobs
node scripts/rpa/nusuk_rpa_local.js
```

**Expected output:**
```
✓ Loaded 12 pending jobs from jobs_queue
✓ Processing job_id abc123 (group_id xyz)
✓ Navigated to NUSUK portal
✓ Filled passport: XXXXXXXXX
✓ Scraped status: approved
✓ Updated traveler nusuk_status
```

### Docker alternative (recommended for CI/CD)

```bash
docker build -t umrahops-rpa -f scripts/rpa/Dockerfile .
docker run --env-file .env umrahops-rpa --groupId=<GROUP_ID>
```

---

## 2. SQLite Durability & Encryption

**Why local-only:** Encryption-at-rest requires OS-level key management; Replit ephemeral storage unsuitable.

### Enable encryption (sqlcipher)

```bash
npm install better-sqlite3-sqlcipher
```

Update `server/db.ts`:

```typescript
import Database from '@journeyapps/sqlcipher';
const sqlite = new Database(sqlitePath);
sqlite.pragma(`key='${process.env.SQLITE_ENCRYPTION_KEY}'`);
```

Add to `.env`:

```
SQLITE_ENCRYPTION_KEY=<32-char-random-hex>
```

### Verify PRAGMA settings

```bash
node -e "const db = require('better-sqlite3')('./data/umrahops.db'); \
  console.log(db.pragma('journal_mode')); \  # Should print: wal
  console.log(db.pragma('foreign_keys'));"   # Should print: 1
```

---

## 3. Heavy Background Workers

**Why local-only:** Long-running Node processes for job queue processing exceed Replit idle timeouts.

### Start job queue worker

```bash
# Run persistent worker that polls jobs_queue every 30s
node scripts/workers/job_processor.js
```

**Process manager (recommended):**

```bash
npm install -g pm2
pm2 start scripts/workers/job_processor.js --name umrahops-worker
pm2 logs umrahops-worker
```

---

## 4. OpenAI High-Throughput Batching

**Why local-only:** Batch API calls (50+ travelers) may hit Replit rate limits; local runs allow retries + caching.

### Run batch risk assessment

```bash
node scripts/ai/batch_risk_assessment.js --groupId=<GROUP_ID>
```

**Expected output:**
```
✓ Loaded 50 travelers from group xyz
✓ Hashed PII (passports) for AI safety
✓ OpenAI batch request created (batch_abc123)
✓ Polling for results... (30s intervals)
✓ Results saved: 48 high/medium risk, 2 low risk
✓ Updated travelers.riskScore in DB
```

---

## 5. Supabase Migration (from SQLite)

**Why local-only:** Data migration with >10K rows requires stable network + transactional guarantees.

### Steps

1. **Export SQLite data:**

```bash
node scripts/migrate/export_sqlite.js > data/export.json
```

2. **Import to Supabase:**

```bash
# Ensure .env has DATABASE_URL set to Supabase Postgres
node scripts/migrate/import_supabase.js data/export.json
```

3. **Verify row counts:**

```bash
psql $DATABASE_URL -c "SELECT 'groups', COUNT(*) FROM groups UNION ALL SELECT 'travelers', COUNT(*) FROM travelers;"
```

---

## 6. Security Checklist Before Production

- [ ] Rotate `.env` secrets (Supabase keys, OpenAI key)
- [ ] Enable disk encryption for `./data/` directory
- [ ] Set `REACT_APP_REMOTE_LOGS=false` unless explicit opt-in
- [ ] Verify RLS policies in Supabase match auth requirements
- [ ] Audit `audit_logs` chain hashes for integrity breaks
- [ ] Test Playwright RPA with valid NUSUK credentials in .env

---

## Quick Reference

| Task | Command | Expected Duration |
|------|---------|------------------|
| RPA worker (10 travelers) | `node scripts/rpa/nusuk_rpa_local.js` | ~2 min |
| AI batch (50 travelers) | `node scripts/ai/batch_risk_assessment.js` | ~30s |
| SQLite → Supabase migration | `node scripts/migrate/import_supabase.js` | 5-10 min (for 10K rows) |
| Enable encryption | Edit `server/db.ts` + restart | 1 min |

---

## Troubleshooting

**"Database is locked":** Another process holds a write lock. Stop dev server, check `data/umrahops.db-wal`.

**Playwright timeout:** NUSUK portal may have changed selectors. Update `scripts/rpa/nusuk_rpa_local.js` selectors (see inline comments).

**OpenAI 429 rate limit:** Batch size too large. Reduce to 25 travelers per call in `scripts/ai/batch_risk_assessment.js`.
