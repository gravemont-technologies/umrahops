# Product Overview & Execution Map

## Core MVP: "UmrahOps" - Local-First Group Operations

**Objective**: Convert messy spreadsheets into validated, auditable operations.  
**Criticality**: High (Deployment depends on build stability; Data integrity depends on Schema).

---

## 1. Foundation & Architecture (Vitality: 10/10)
| Component | Status | Gap Analysis |
|-----------|--------|--------------|
| **Build System** | ⚠️ At Risk | Separated `tsconfig` (Client/Server) stabilized build, but type safety is bypassed (`@ts-nocheck`). **Fix Priority: Critical**. |
| **Database** | ✅ Stable | SQLite (Local) + Supabase (Prod) strategy is sound. Drizzle ORM configured. |
| **API Layer** | ✅ Stable | Express server with `api/serverless.js` entry point for Vercel. |
| **Authentication**| ✅ Stable | Supabase Auth implemented. |

## 2. Core Workflows (Vitality: 9/10)
### A. Group Management
- [x] Create Group (Modal)
- [x] List Groups (Dashboard)
- [x] Group Details View
- [ ] **Gap**: "Drop Venture" / Delete Group functionality not fully integrated in UI?

### B. Traveler Management
- [x] CSV Upload (PapaParse)
- [x] Validation (Canonical Schema)
- [x] List Travelers
- [ ] **Gap**: Real-time validation feedback loop needs polish.

### C. Operations & Context
- [x] Objectives Panel (UI)
- [x] Office Assistant (Chat UI)
- [ ] **Gap**: "AI Service" is currently a stub/mock. Needs connection to real OpenAI/Context.

## 3. Discrepancies & Anomalies
1.  **Missing Types**: `shared/schema.ts` has `@ts-nocheck`. This means Drizzle might insert invalid data if Zod validation fails silently or at runtime only.
2.  **Dev Environment**: `cross-env` was missing, causing `npm run dev` to fail on Windows. (Fixed).
3.  **Client Types**: The Client `tsconfig` was using `NodeNext` (Server style) causing "Cannot find module" errors in IDE. (Fixed).

## Execution Plan (Pareto Optimized)

### Phase 1: Surgical Stabilization (Current)
1.  **Solidify Schema**: Remove `@ts-nocheck` from `shared/schema.ts`. Fix the types so backend build is *legitimately* safe.
2.  **Verify Build**: Ensure `npm run build:server` passes without strict mode waivers.

### Phase 2: Functional vitality
1.  **AI Workflow**: Connect `aiService` to real endpoints (if key present) or robust mock.
2.  **Dashboard/Tabs**: Ensure "DemoContext" isn't the only driver; connect real DB data to Dashboard components.
