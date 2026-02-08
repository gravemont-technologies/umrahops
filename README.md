# UmrahOps Developer Handbook

**One-sentence goal:** Local-first PWA that converts messy group spreadsheets into a validated, auditable, offline-capable operations platform—automating visa/program checks while keeping all sensitive data local, configurable via a single `.env`.

---

## Quick Start (Replit)

1. **Set Secrets:** Add secrets in Replit Tools matching `.env.example`.
2. **Run Dev:** Click "Run" (executes `npm run dev`).
3. **App:** Open the Webview at port 5000.
4. **Tests:** Run `npm test`.

---

## Quick Start (Local)

```bash
# 1. Clone
git clone https://github.com/truegvmt/umrahops.git
cd umrahops

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase/OpenAI keys

# 4. Initialize database (SQLite)
npm run db:init

# 5. Run dev server
npm run dev
# Open http://localhost:5000
```

---

## Environment Variables

All external services reference `.env` keys. **Set once, everything connects.**

```bash
# Supabase Auth (required for production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI API (optional; mock mode if absent)
OPENAI_API_KEY=sk-...

# NUSUK Integration (optional)
VITE_NUSUK_URL=https://api.nusuk.sa/v1  # if API available
VITE_NUSUK_TOKEN=your-token             # if API requires auth

# Optional: Remote logging (opt-in only)
LOG_SERVER_URL=https://logs.example.com/ingest

# Local SQLite path (default: ./data/umrahops.db)
SQLITE_PATH=./data/umrahops.db

# Supabase Postgres (for dual-mode or migration)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Startup check:** On boot, `scripts/startupCheck.ts` validates required vars and shows friendly errors if missing.

---

## Architecture Overview

### Data Flow

```
CSV Upload → PapaParse → Canonical Validator → dbService → SQLite/Supabase
                                                     ↓
                                            AI Risk Scoring (batched, PII-safe)
                                                     ↓
                                            workflowService updates step progress
                                                     ↓
                                            UI hooks auto-refresh (BroadcastChannel)
```

### Service Layer Contracts

| Service | Role | Integration Points |
|---------|------|-------------------|
| **dbService** | CRUD for groups/travelers/hotels | SQLite/Supabase via Drizzle ORM; write-queue for safe concurrency |
| **authService** | Supabase session management | Exposes `getSession()`, `agentId` for audit logs |
| **aiService** | Non-PII risk scoring | Accepts hashed features; returns `riskScore`/`riskReason`; batches 25-50 travelers |
| **nusukBulkImporter** | NUSUK sync (API or RPA) | Mode A: API POST; Mode B: enqueue jobs for local Playwright RPA |
| **workflowService** | Step progression (1-6) | Updates group step state; triggers hooks |
| **messageService** | WhatsApp deep links | Generates `wa://send` links with templates; tracks `messageStatus` |
| **exportService** | PDF generation | Client-side jsPDF from DB; includes progress/audit logs |
| **auditService** | Immutable action log | Writes chained hashes; optional remote push if `LOG_SERVER_URL` set |

---

## Database Strategy

### Dual-Mode: SQLite (local/Replit) + Supabase (production)

- **Local/Replit:** Uses `better-sqlite3` with WAL mode, foreign keys, and busy timeout (see `server/db.ts`).
- **Supabase:** PostgreSQL schema in `db/migrations/supabase_schema.sql` with RLS policies, UUIDs, and audit chain integrity.

**To migrate SQLite → Supabase:**

```bash
node scripts/migrate/export_sqlite.js > data/export.json
node scripts/migrate/import_supabase.js data/export.json
```

### Schema Highlights

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `groups` | Group/batch entity | `name`, `status`, `steps_completed`, `created_by` |
| `travelers` | Individual pilgrims | `passport_hash` (not raw PII), `risk_score`, `nusuk_status`, `message_status` |
| `hotels` | Hotel inventory | `rooms`, `inventory` JSONB |
| `bookings` | Room assignments | `check_in`, `check_out`, conflict detection |
| `audit_logs` | Immutable action trail | `hash` = SHA-256(prev_hash + payload_hash + timestamp) for chain integrity |
| `jobs_queue` | Background tasks | `type` (nusuk_sync, ai_risk_batch), `status`, `attempts` |

**Execute Supabase schema:**

1. Open Supabase SQL Editor.
2. Paste contents of `db/migrations/supabase_schema.sql`.
3. Run.

---

## Local-Only Procedures

See `docs/manual_local_steps.md` for:

- **Playwright RPA workers** (NUSUK automation)
- **SQLite encryption** (at-rest with sqlcipher)
- **Background job queue** (persistent pm2 worker)
- **OpenAI batching** (high-throughput for 50+ travelers)
- **Security hardening** (token storage, audit chain verification)

---

## Testing

```bash
# Run all tests
npm test

# Test specific service
npm test -- dbService

# E2E (local only, requires Playwright)
npm run test:e2e
```

**What's tested:**

- ✅ dbService write-queue (serial writes, no race conditions)
- ✅ Canonical validator (zod schema + error codes)
- ✅ AI service mock mode (deterministic flags when no API key)
- ✅ Audit chain hash integrity (detect tampering)
- ⏳ RPA stub (headless requires local Playwright install)

---

## CI/CD Notes

- **GitHub Actions:** `.github/workflows/ci.yml` runs lint + tests; **does NOT** run Playwright headful tasks.
- **Replit Deployments:** Set secrets via Replit Tools; avoid enabling browser automation (resource limits).
- **Self-hosted runners:** Use for Playwright RPA in CI (Docker image: `scripts/rpa/Dockerfile`).

---

## Feature Status & Audit Result (v1.1)

| Feature | Status | % Complete | Notes |
|---------|--------|-----------|-------|
| **Environment & Config** | ✅ Done | 100% | `.env.example` + startup validation |
| **Database (Hybrid)** | ✅ Done | 100% | Auto-detects SQLite (dev) or Postgres (prod) |
| **CSV Import** | ✅ Done | 100% | Column mapping, date parsing, nationality fallback |
| **Traveler Management** | ✅ New | 100% | Live Edit, Update, and Delete with sync |
| **AI Risk Scoring** | ✅ Done | 95% | Batched OpenAI calls with caching & mocking |
| **NUSUK Integration** | ✅ Done | 100% | Background job queue + local RPA worker |
| **Audit & Compliance** | ✅ Done | 100% | Immutable chain + **UI Verification Button** |
| **Workflow Engine** | ✅ Done | 90% | Step progression; real-time dashboard stats |
| **Messaging (WhatsApp)** | ✅ Done | 100% | Direct buttons + automatic audit logging |
| **PDF Export** | ⏳ In progress | 40% | Core generation functional; UI pending |

---

## 🔒 Security & Data Integrity

- **Cryptographic Audit Trail**: Every action (import, edit, scan, send) is chained via SHA-256 hashes.
- **On-Demand Verification**: Go to **Audit Logs** and click "Verify Integrity" to prove the chain hasn't been tampered with.
- **PII-Safe AI**: We never send raw passport numbers to OpenAI; only deterministic hashes are used for risk scoring.
- **Secret Protection**: Includes a `scripts/validateEnv.ts` to block deployment if secrets are exposed.

---

## Security Checklist Before Production

- [ ] **Rotate `.env` secrets** (Supabase keys, OpenAI key) — never commit to public repos.
- [ ] **Enable disk encryption** for `./data/` directory (OS-level or sqlcipher).
- [ ] **Set `REACT_APP_REMOTE_LOGS=false`** unless explicit user opt-in.
- [ ] **Verify RLS policies** in Supabase match your auth logic (e.g., `created_by` = `auth.uid()`).
- [ ] **Test audit chain integrity:** Run `node scripts/verify_audit_chain.js` and check for hash breaks.
- [ ] **Secure token storage:** Use `sessionStorage` (not `localStorage`) for auth tokens; rotate periodically.
- [ ] **AI PII safety:** Confirm `passport_hash` is SHA-256 (non-reversible); never send raw `passport_number` to OpenAI.

---

## Resource-Sparing Constraints (Replit)

To keep within Replit limits:

- ❌ **Do NOT** execute Playwright headful tasks (use local or Docker).
- ❌ **Do NOT** run long-lived background workers (>5 min idle timeout).
- ✅ **DO** lazy-load PDF preview and RPA helper modules (code-split).
- ✅ **DO** keep main bundle < 400 KB (use `npm run build -- --analyze`).

---

## What to Run Locally First (Post-Download Checklist)

After cloning the repo, run these **in order:**

1. ✅ `npm install`
2. ✅ `cp .env.example .env` (fill Supabase + OpenAI keys)
3. ✅ `npm run db:init` (creates SQLite with migrations)
4. ✅ `npm run dev` (starts frontend + API server)
5. ⏳ *Optional:* Install Playwright for RPA: `npx playwright install chromium`

For **production/heavy workloads**, also run:

6. ⏳ Enable SQLite encryption (see `docs/manual_local_steps.md`)
7. ⏳ Start background job worker: `pm2 start scripts/workers/job_processor.js`
8. ⏳ Run NUSUK RPA: `node scripts/rpa/nusuk_rpa_local.js --groupId=<ID>`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Database is locked" | Concurrent writes without queue | Stop dev server; remove `-wal` files; restart |
| Playwright timeout | NUSUK portal selectors changed | Update `scripts/rpa/nusuk_rpa_local.js` selectors (see comments) |
| OpenAI 429 rate limit | Batch size too large | Reduce to 25 travelers/batch in `aiService.ts` |
| "Failed to fetch" on login | Missing Supabase keys in `.env` | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set |

---

## Support & Contributing

- **Issues:** https://github.com/truegvmt/umrahops/issues
- **Docs:** `docs/` folder in repo
- **License:** MIT
