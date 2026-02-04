# UmrahOps Vercel Deployment (Authoritative)

## Purpose

This document defines the **only correct mental model and procedure** for deploying UmrahOps to Vercel. This is a **serverless deployment**, not a traditional Express server. Treat it as such or the system will fail.

---

## Reality Check (Read First)

* Vercel **does not run persistent servers**
* Express is **not** deployed as a server
* Express is compiled and **executed per-request** inside a serverless function
* All filesystem writes are **ephemeral**
* All state must live in **external services**

If you expect:

* long‑running processes
* WebSockets
* cron jobs
* background workers
* persistent SQLite

**Stop. This platform is wrong for that use case.**

---

## Architecture (Actual)

* **Frontend**: Vite + React → static assets
* **Backend**: Express app → imported as a handler
* **Runtime**: Vercel Serverless Functions (cold starts)
* **Database**:

  * Local dev: SQLite
  * Production: PostgreSQL (Supabase / Vercel Postgres mandatory)

There is no shared runtime between frontend and backend.

---

## Build Contract

The build must produce **exactly**:

```
api/
└── serverless.js   # The bundled Express app (Surgical One-File Function)
dist/
└── public/        # Static frontend (Vercel CDN)
```

If this contract is broken, deployment fails.

---

## Pre‑Deployment Checklist (Non‑Negotiable)

### 1. Install Dependencies

```bash
npm install
```

Ensures all runtime and type dependencies exist, including `@types/better-sqlite3`.

---

### 2. Local Production Build

```bash
npm run build
```

**Must succeed with zero errors.**

Verify outputs:

* `dist/public/index.html` exists
* `dist/index.cjs` exists

---

### 3. Local Production Simulation

```bash
npm start
```

Verify:

* App loads on `http://localhost:5000`
* `/api/*` routes respond
* No filesystem assumptions
* No long‑running state

---

## Vercel Deployment Procedure

### Step 1: Push to GitHub

```bash
git add .
git commit -m "deploy: vercel serverless build"
git push origin main
```

---

### Step 2: Import into Vercel

* New Project → Import GitHub repo
* Repo: `truegvmt/umrahops`

---

### Step 3: Build Settings (Exact)

| Setting          | Value           |
| ---------------- | --------------- |
| Framework        | **Other**       |
| Build Command    | `npm run build` |
| Output Directory | `dist/public`   |
| Install Command  | `npm install`   |
| Node Version     | 18.x or 20.x    |

Do **not** select Vite.

---

### Step 4: Environment Variables

```
NODE_ENV=production
SQLITE_PATH=/tmp/umrahops.db
```

SQLite is tolerated **only** for demos.

---

### Step 5: Deploy

Click **Deploy**. No manual steps.

---

## How Requests Are Handled (Critical)

1. Browser loads static React app from CDN
2. API request hits `/api/serverless`
3. Vercel spins up a function
4. Express app is imported into memory
5. Request handled
6. Function is destroyed

No memory survives between requests.

---

## Post‑Deployment Verification

### Build Logs

Confirm:

* `npm install` success
* `npm run build` success
* No TypeScript errors
* `dist/` artifacts present

---

### Runtime Validation

Verify:

* UI loads
* Routes work
* Language toggle works
* `/api/stats` responds

---

### Function Logs

* No `ERR_MODULE_NOT_FOUND`
* No filesystem errors
* No long execution times

---

## Known Failure Modes

### Express Treated as Server

**Symptom**: random 500s, cold start bugs

**Cause**: calling `app.listen()` or relying on server state

**Fix**: export Express as handler only

---

### SQLite Data Loss

**Symptom**: data resets

**Cause**: ephemeral filesystem

**Fix**: migrate database

---

### Static Files Not Served

**Symptom**: blank page

**Fix**:

* Ensure `dist/public/index.html` exists
* Ensure `vercel.json` routes fallback to `/api/serverless`

---

## Production Migration (Required)

### Database

SQLite must be removed.

Use one:

* Supabase PostgreSQL (recommended)
* Vercel Postgres

Set:

```
DATABASE_URL=postgresql://...
```

---

### Session & Secrets

```
SESSION_SECRET=<random>
```

No hardcoded secrets.

---

## When to Abandon Vercel

Migrate backend elsewhere if you need:

* WebSockets
* queues
* workers
* cron
* heavy DB usage
* predictable latency

Frontend can stay on Vercel.

---

## Status

This deployment is **valid, correct, and limited by design**.

It is an **entry‑phase architecture**, not a final system.

---

**Last Updated**: 2026‑02‑02  
**Node**: 20.x  
**Vercel CLI**: 50.x
