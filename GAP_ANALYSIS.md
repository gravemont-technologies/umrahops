# UmrahOps Comprehensive Gap Analysis
**Scan Date:** 2026-02-01 22:10  
**Based on:** Workflow document (Pakistan → Makkah flow)

---

## 📊 Workflow-to-Implementation Matrix

### ✅ PHASE 1: Core Infrastructure (100% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| Express + Vite server | `server/index.ts` | ✅ Done |
| SQLite + WAL mode | `src/db/init.ts` | ✅ Done |
| Drizzle ORM schema | `shared/schema.ts` | ✅ 6 tables |
| Environment config | `.env.example` | ✅ Documented |
| Windows compatibility | `cross-env` in scripts | ✅ Done |

### ✅ PHASE 2: Data Layer (95% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| Groups CRUD | `routes.ts` + `storage.ts` | ✅ Done |
| Travelers CRUD | `routes.ts` + `storage.ts` | ✅ Done |
| Bulk import | `POST /api/travelers/bulk` | ✅ Done |
| Hotels table | `schema.ts` hotels | ✅ Schema only |
| Bookings table | `schema.ts` bookings | ✅ Schema only |
| **Hotels API** | No endpoints | ❌ Missing |
| **Bookings API** | No endpoints | ❌ Missing |

### ✅ PHASE 3: Validation & Import (100% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| Canonical CSV template | `shared/canonical.ts` | ✅ Done |
| Auto column mapping | `autoMapColumns()` | ✅ Done |
| Batch validation | `validateBatch()` | ✅ Done |
| Error codes i18n | `errorCodeMessages` | ✅ Done |
| CSV uploader UI | `CsvUploader.tsx` | ✅ Wired |

### ✅ PHASE 4: AI Risk Assessment (100% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| AI service | `server/services/aiService.ts` | ✅ Enhanced |
| Batching (50/batch) | `assessBatch()` | ✅ Done |
| Caching (24h TTL) | `ai/cache.json` | ✅ Done |
| PII-safe hashing | SHA-256 passport hash | ✅ Done |
| Rate limit handling | Exponential backoff | ✅ Done |
| API endpoint | `POST /api/groups/:id/risk-scan` | ✅ Done |
| UI button wired | `GroupDetail.tsx` | ✅ Done |

### ⚠️ PHASE 5: NUSUK Integration (70% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| NUSUK service | `server/services/nusukService.ts` | ✅ Stub |
| Job queue | `jobs_queue` table | ✅ Done |
| Submit endpoint | `POST /api/groups/:id/nusuk-submit` | ✅ Done |
| UI button wired | `GroupDetail.tsx` | ✅ Done |
| **RPA worker** | `scripts/rpa/nusuk_rpa_local.ts` | ⚠️ Scaffold only |
| **Job processor** | Polling/executing jobs | ❌ Missing |
| **Status callbacks** | Update traveler nusuk_status | ❌ Missing |

### ⚠️ PHASE 6: Messaging (50% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| Message service | `server/services/messageService.ts` | ✅ Basic |
| WhatsApp deep links | `generateWhatsAppLink()` | ✅ Done |
| **Template selection** | No templates defined | ❌ Missing |
| **Bulk messaging UI** | No component | ❌ Missing |
| **Messaging endpoint** | No API route | ❌ Missing |

### ✅ PHASE 7: Audit & Compliance (100% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| Audit logs table | `audit_logs` | ✅ Done |
| Chain hashing | SHA-256 with prevHash | ✅ Done |
| Verify endpoint | `GET /api/audit/verify` | ✅ Done |
| Audit logs UI | `AuditLogs.tsx` | ✅ Done |

### ⚠️ PHASE 8: Dashboard & Reporting (80% Complete)

| Workflow Step | Implementation | Status |
|---------------|---------------|--------|
| Dashboard | `Dashboard.tsx` | ✅ Done |
| Groups list | `GroupsList.tsx` | ✅ Done |
| Group detail | `GroupDetail.tsx` | ✅ Done |
| Jobs queue | `JobsQueue.tsx` | ✅ Done |
| **Traveler count** | Hardcoded mock | ❌ Gap |
| **Aggregate stats API** | No endpoint | ❌ Missing |

---

## 🔴 Critical Gaps (Immediate Action Required)

### 1. Job Processor Missing
**Impact:** NUSUK jobs sit in queue but never execute  
**Fix:** Create `scripts/jobProcessor.ts` that polls jobs_queue and invokes RPA/API

### 2. Hotels/Bookings API Missing  
**Impact:** Step 2 (assign hotels) cannot be completed  
**Fix:** Add CRUD endpoints for hotels and bookings

### 3. Aggregate Stats API Missing
**Impact:** Dashboard shows fake numbers  
**Fix:** Add `GET /api/stats` returning real counts

---

## 🟡 Medium Priority Gaps

| Gap | Impact | Fix |
|-----|--------|-----|
| Messaging endpoint missing | Step 4 incomplete | Add `POST /api/messages/send` |
| Template selection UI | No message customization | Add templates array + UI |
| RPA selectors not customized | NUSUK automation non-functional | Update selectors for live portal |

---

## 🟢 Low Priority Gaps

| Gap | Impact | Fix |
|-----|--------|-----|
| Settings page stub | No admin config | Implement settings |
| PDF export | Step 6 final deliverable | Add export service |
| Language toggle persistence | UX polish | Add localStorage |

---

## 🚀 Highest-Leverage Fixes (Priority Order)

1. **Add Stats Endpoint** (5 min) - Real dashboard numbers
2. **Add Hotels/Bookings CRUD** (15 min) - Enables hotel assignment
3. **Create Job Processor** (20 min) - Enables NUSUK automation
4. **Add Messaging Endpoint** (10 min) - Enables bulk WhatsApp

---

## Execution Plan

| # | Task | Time | Files |
|---|------|------|-------|
| 1 | Stats endpoint | 5m | `routes.ts` |
| 2 | Hotels CRUD | 10m | `routes.ts`, `storage.ts` |
| 3 | Bookings CRUD | 10m | `routes.ts`, `storage.ts` |
| 4 | Job processor script | 15m | `scripts/jobProcessor.ts` |
| 5 | Messaging endpoint | 10m | `routes.ts` |
