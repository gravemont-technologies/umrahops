# UmrahOS Deployment Strategy: Railway + Docker Optimized

This document maps out the "Success Path" for deploying UmrahOS, accounting for its complex requirements: **AI Services**, **RPA (Playwright) Workers**, and **Cryptographic Audit Trails**.

---

## 🏗️ 1. Selected Host: [Railway.app](https://railway.app)

**Why Railway?**
Standard serverless (Vercel) fails for this architecture because:
1.  **RPA Needs Browsers**: Vercel functions cannot easily install Chromium/Playwright system dependencies.
2.  **Long-Running Jobs**: Visa submissions (NUSUK) can exceed Vercel's 10-60s timeouts.
3.  **Persistent Workers**: The `jobProcessor.ts` needs to poll the database continuously.

Railway provides **Docker-based persistent hosting**, which is the only reliable way to run the RPA worker in production.

---

## 🗺️ 2. Architectural Mapping

| Component | Production State | Deployment Mode |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Static assets served by Express |
| **Backend** | Express (Node 20) | Unified Docker Image |
| **Database** | PostgreSQL (Managed) | Supabase or Railway Postgres |
| **Jobs Queue** | `jobs_queue` table | Background Worker thread in Docker |
| **RPA / NUSUK** | Playwright | Headless Chromium in Docker |

### Integrative Deployment Flow:
1.  **Build**: Vite compiles frontend to `/dist/public`.
2.  **Bundle**: Backend code bundled to `/dist/server`.
3.  **Containerize**: Docker image wraps the app with all browser dependencies.
4.  **Serve**: Single entry point serves both API and UI.

---

## 🛠️ 3. Implementation Plan

### Step A: The Dockerfile
Create a `Dockerfile` to handle the Playwright OS dependencies:

```dockerfile
# Use the official Microsoft Playwright image
FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start:prod"]
```

### Step B: Database Migration
Switch from SQLite to PostgreSQL for production stability:
1.  Connect to your **Supabase Postgres** instance.
2.  Run `npm run db:push` to sync schemas.
3.  Update `server/db.ts` to use `pg` instead of `better-sqlite3` based on `NODE_ENV`.

---

## 🔑 4. Environment Configuration (Secrets)

Set these in the **Railway Dashboard** (Settings > Variables):

| Variable | Importance | Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | **Required** | Postgres connection string |
| `SESSION_SECRET` | **Required** | Secure string for cookie signing |
| `OPENAI_API_KEY` | Recommended | For AI Risk Scans & Objectives |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `5000` | Internally mapped by Railway |

---

## ✅ 5. The "DO IT" Section (Surgical Steps)

From your current Git state, follow these steps precisely to reach production:

### Step 1: Provision Infrastructure
1.  **Railway**: Create a new project.
2.  **Database**: Provision a **PostgreSQL** instance (either on Railway or Supabase).
    *   *Copy the Connection String:* You will need this for `DATABASE_URL`.

### Step 2: Environment Setup
In Railway "Variables", add:
- `DATABASE_URL`: `postgres://...`
- `SESSION_SECRET`: `(generate a random 32-char string)`
- `NODE_ENV`: `production`

### Step 3: Schema Sync (The Bridge)
From your local terminal (while connected to the production DB via `.env`):
```bash
# Push schema to production Postgres
npm run db:push
```
*Note: Our `drizzle.config.ts` is now hybrid and will auto-detect the Postgres dialect.*

### Step 4: Deploy
1.  Connect Railway to your GitHub repository.
2.  Railway will build using the `Dockerfile`.
3.  **Gap Check**: The server will automatically:
    *   Initialize the Postgres connection.
    *   Serve the React frontend from `/dist/public`.
    *   **Spawn the Job Processor**: A background worker will start inside the same container to handle NUSUK syncing and RPA tasks.

### Step 5: Verification
1.  Open your Railway URL.
2.  Go to the **Audit Logs** page.
3.  Click **"Verify Integrity"**.
    *   If it returns "Chain Verified", your cryptographic audit trail is successfully running on Postgres.

---

## 🔍 Gap Analysis (Resolved)

| Potential Gap | Resolution Status |
| :--- | :--- |
| **SQLite vs Postgres** | **RESOLVED**: `server/db.ts` now uses a hybrid connector. |
| **Worker Process** | **RESOLVED**: `server/index.ts` now spawns the `jobProcessor` as a child process in production. |
| **RPA Dependencies** | **RESOLVED**: Using `mcr.microsoft.com/playwright` as the base Docker image. |
| **Schema Dialect** | **RESOLVED**: `drizzle.config.ts` dynamically switches to `postgresql` when `DATABASE_URL` is set. |

---

## ⚖️ 6. Scaling & Efficiency

- **Vertical Scaling**: Scale to 2GB RAM if running multiple simultaneous RPA browsers.
- **Monitoring**: Use `.env` with `LOG_LEVEL=info` to track job processor health in the Railway console.
- **Audit Stability**: Because the audit trail is cryptographic, it remains intact even if the container restarts or migrates.

**Integrative Success**: By using a single Dockerized container, you eliminate CORS headaches, simplify secret management, and ensure the RPA worker has exactly the OS environment it needs to succeed.

---
**Strategy Status**: ✅ Recommended for High-Integrity Operations.
**Last Updated**: 2026-02-08
