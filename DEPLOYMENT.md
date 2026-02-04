# UmrahOps Deployment Roadmap

This guide covers how to run UmrahOps locally for development and how to deploy it to Vercel for production.

---

## 🚀 1. Local Development (Quick Start)

To get the app running on your machine for development:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   * Copy `.env.example` to `.env`.
   * Fill in your keys (Supabase, OpenAI).
3. **Initialize Database**:
   ```bash
   npm run db:init
   ```
4. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   * The app will be available at `http://localhost:5000`.
   * Uses `tsx` for real-time backend updates and `Vite` for frontend HMR.

---

## 🏗️ 2. Local Production Verification

Always verify the production build locally before pushing to Vercel.

1. **Build the Application**:
   ```bash
   npm run build
   ```
   * This generates `dist/public` (frontend) and `dist/server` (backend).
2. **Test Production Run**:
   ```bash
   npm start
   ```
   * This runs the app using the transpiled JavaScript in `dist/server`.
   * Confirm that navigation and API calls work.

---

## ☁️ 3. Vercel Deployment (Serverless)

UmrahOps is designed to run as a **Serverless Function** on Vercel.

### Vercel Configuration Settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/public` |
| **Install Command** | `npm install` |
| **Node.js Version** | 20.x |

### Deployment Steps:

1. **GitHub Push**:
   ```bash
   git add .
   git commit -m "build: finalize for deployment"
   git push origin main
   ```
2. **Connect to Vercel**:
   * Create a new project in Vercel.
   * Import your GitHub repository.
3. **Environment Variables**:
   * Add all keys from your `.env` to Vercel Project Settings > Environment Variables.
   * **Crucial**: Ensure `SQLITE_PATH` is set to `/tmp/umrahops.db` for ephemeral Vercel storage (demo mode) or provide a `DATABASE_URL` for Supabase Postgres (production mode).
4. **Trigger Deploy**:
   * Vercel will automatically build and deploy the app.

---

## 🛡️ 4. Vital Infrastructure (9/10 Quality)

To maintain a solid production standard:

* **Persistence**: SQLite is ephemeral on Vercel. For permanent data, connect **Supabase PostgreSQL** via `DATABASE_URL`.
* **Type Safety**: The build process runs `tsc` for the server. Do not bypass errors with `@ts-nocheck` in production.
* **Audit Logs**: Ensure `SQLITE_PATH` exists or the PG connection is stable to prevent audit trail breaks.

---

## 🛠️ Troubleshooting

* **404 on UI Refresh**: The `vercel.json` ensures all requests fallback to the serverless handler, which serves `index.html`.
* **Database Locked**: If using SQLite locally, ensure no other process is holding the `.db` file.
* **Module Not Found**: Ensure `api/serverless.js` correctly points to `../dist/server/server/index.js`.

---

**Last Verified**: 2026-02-04
**Build Strategy**: Split TSC (Server) + Vite (Client)
