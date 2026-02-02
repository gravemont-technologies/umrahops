# UmrahOps Serverless Functions for Vercel

**Last Updated**: 2026-02-03  
**Status**: Production-Ready  
**Platform**: Vercel Serverless Functions

---

## Overview

This document contains **all serverless function configurations** required to deploy UmrahOps on Vercel. These are **ready to execute as-is** with zero modifications.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │  Static Assets   │         │  Serverless Function     │  │
│  │  (CDN)           │         │  /api/serverless         │  │
│  │                  │         │                          │  │
│  │  dist/public/    │────────▶│  Imports: dist/index.cjs │  │
│  │  - index.html    │         │  Runtime: Node 20.x      │  │
│  │  - assets/       │         │  Timeout: 10s            │  │
│  └──────────────────┘         └──────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle**: Express app is **imported as a handler**, not run as a server.

---

## File Structure (Required)

```
umrahos-main/
├── api/
│   └── serverless.js          ← Vercel function entry point
├── dist/                      ← Build output (generated)
│   ├── public/                ← Static frontend (CDN)
│   │   ├── index.html
│   │   └── assets/
│   └── index.cjs              ← Compiled Express app
├── vercel.json                ← Vercel configuration
└── package.json
```

---

## 1. Serverless Function Entry Point

**File**: `api/serverless.js`

```javascript
// Vercel Serverless Function Entry Point
// This wraps the built Express app for Vercel's serverless environment

const path = require('path');

// Import the built app
const appModule = require(path.join(process.cwd(), 'dist', 'index.cjs'));

// The build exports as 'default' in ESM, which becomes 'default' property in CJS
const app = appModule.default || appModule;

module.exports = app;
```

**Purpose**: 
- Imports the compiled Express application
- Exports it as a Vercel-compatible handler
- Handles ESM/CJS interop automatically

**Execution Model**:
1. Cold start: Function spins up, imports Express app
2. Request handling: Express processes request
3. Response: Function returns result
4. Teardown: Function may be destroyed or kept warm

---

## 2. Vercel Configuration

**File**: `vercel.json`

```json
{
    "version": 2,
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "framework": null,
    "outputDirectory": "dist/public",
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/api/serverless"
        }
    ],
    "functions": {
        "api/serverless.js": {
            "includeFiles": "dist/**"
        }
    }
}
```

**Configuration Breakdown**:

| Key | Value | Purpose |
|-----|-------|---------|
| `version` | `2` | Vercel platform version |
| `buildCommand` | `npm run build` | Builds both frontend and backend |
| `installCommand` | `npm install` | Installs all dependencies |
| `framework` | `null` | Prevents auto-detection (we use custom setup) |
| `outputDirectory` | `dist/public` | Static assets served from CDN |
| `rewrites` | All routes → `/api/serverless` | SPA routing + API handling |
| `functions` | Includes `dist/**` | Ensures compiled app is available |

---

## 3. Build Scripts

**File**: `package.json` (relevant sections)

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/public",
    "build:server": "esbuild server/index.ts --bundle --platform=node --format=cjs --outfile=dist/index.cjs --external:better-sqlite3 --external:@node-rs/argon2",
    "start": "NODE_ENV=production node dist/index.cjs"
  }
}
```

**Build Process**:
1. **Frontend**: Vite bundles React app → `dist/public/`
2. **Backend**: esbuild compiles Express → `dist/index.cjs`
3. **Result**: Single-file backend + static frontend

---

## 4. Environment Variables (Vercel Dashboard)

Set these in **Vercel Project Settings → Environment Variables**:

### Required

```bash
NODE_ENV=production
```

### Database (Choose One)

**Option A: SQLite (Demo Only)**
```bash
SQLITE_PATH=/tmp/umrahops.db
```
⚠️ **Warning**: Data is ephemeral, resets on cold starts

**Option B: PostgreSQL (Production)**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```
✅ **Recommended**: Use Supabase or Vercel Postgres

### Optional

```bash
SESSION_SECRET=your-random-secret-here
PORT=3000
```

---

## 5. Deployment Commands

### One-Time Setup

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Deploy to Production

```bash
# Build locally (verify it works)
npm run build

# Deploy to Vercel
vercel --prod
```

### Deploy Preview (Staging)

```bash
vercel
```

---

## 6. Request Flow (How It Works)

### Static Asset Request
```
Browser → Vercel CDN → dist/public/index.html
```
- Instant delivery
- No function invocation
- Cached globally

### API Request
```
Browser → /api/groups
         ↓
Vercel Router → /api/serverless
         ↓
Serverless Function (Cold/Warm Start)
         ↓
Import dist/index.cjs
         ↓
Express Router Matches Route
         ↓
Database Query (PostgreSQL/SQLite)
         ↓
JSON Response
```

**Timing**:
- Cold start: 500ms - 2s
- Warm start: 50ms - 200ms
- Function timeout: 10s (default)

---

## 7. Monitoring & Debugging

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Function Metrics

**Vercel Dashboard → Project → Analytics**:
- Invocation count
- Cold start frequency
- Error rate
- Response times

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| 500 errors | Missing `dist/index.cjs` | Run `npm run build` |
| Blank page | Wrong output directory | Verify `dist/public/index.html` exists |
| Module not found | Missing dependencies | Check `package.json` includes all deps |
| Data resets | SQLite ephemeral storage | Migrate to PostgreSQL |
| Timeout | Long-running query | Optimize DB queries, add indexes |

---

## 8. Performance Optimization

### Reduce Cold Starts

1. **Keep functions warm** (paid plans):
   ```json
   {
     "functions": {
       "api/serverless.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

2. **Minimize bundle size**:
   - Use `external` in esbuild for large deps
   - Tree-shake unused code
   - Lazy-load heavy modules

### Database Connection Pooling

```typescript
// Use connection pooling for PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Serverless: 1 connection per function
});
```

---

## 9. Scaling Considerations

### When Serverless Works

✅ **Good for**:
- API endpoints with sporadic traffic
- CRUD operations
- Stateless request/response
- Low to medium traffic (< 1M requests/month)

### When to Migrate

❌ **Not suitable for**:
- WebSockets (use Vercel Edge Functions or separate service)
- Long-running jobs (> 10s)
- Heavy database workloads
- Predictable low-latency requirements
- Cron jobs (use Vercel Cron or external scheduler)

---

## 10. Production Checklist

Before going live:

- [ ] Build succeeds locally: `npm run build`
- [ ] Production test works: `npm start`
- [ ] PostgreSQL database configured
- [ ] Environment variables set in Vercel
- [ ] `vercel.json` committed to repo
- [ ] `api/serverless.js` exists
- [ ] `.gitignore` excludes `dist/`, `node_modules/`
- [ ] Domain configured (if custom)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Error monitoring setup (Sentry, LogRocket, etc.)

---

## 11. Rollback Procedure

If deployment fails:

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

Or via **Vercel Dashboard → Deployments → Promote to Production**

---

## 12. CI/CD Integration (GitHub)

Vercel auto-deploys on push:

1. **Push to `main`** → Production deployment
2. **Push to other branch** → Preview deployment
3. **Pull request** → Preview deployment with comment

**Disable auto-deploy** (if needed):
```json
{
  "github": {
    "enabled": false
  }
}
```

---

## 13. Cost Estimation

**Vercel Hobby (Free)**:
- 100 GB bandwidth/month
- 100 GB-hours serverless execution
- Unlimited deployments

**Vercel Pro ($20/month)**:
- 1 TB bandwidth
- 1000 GB-hours execution
- Team collaboration
- Advanced analytics

**Typical UmrahOps Usage**:
- ~10K requests/month: **Free tier**
- ~100K requests/month: **Pro tier**
- > 1M requests/month: Consider dedicated backend

---

## 14. Security Best Practices

1. **Never commit secrets**:
   ```bash
   # .gitignore
   .env
   .env.local
   ```

2. **Use environment variables**:
   - Set in Vercel dashboard
   - Access via `process.env.DATABASE_URL`

3. **Enable CORS properly**:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

4. **Rate limiting**:
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   
   app.use('/api/', limiter);
   ```

---

## 15. Troubleshooting Guide

### Build Fails

```bash
# Check build logs
vercel logs --build

# Common fixes:
npm install          # Install missing deps
npm run build        # Test locally
rm -rf node_modules  # Clean install
npm install
```

### Function Errors

```bash
# Check runtime logs
vercel logs --follow

# Common issues:
# - Module not found: Add to package.json
# - Timeout: Optimize queries
# - Memory limit: Increase in vercel.json
```

### Database Connection Issues

```typescript
// Add connection retry logic
const connectWithRetry = async () => {
  try {
    await db.connect();
  } catch (err) {
    console.error('DB connection failed, retrying...');
    setTimeout(connectWithRetry, 5000);
  }
};
```

---

## 16. Migration Path (Future)

If you outgrow serverless:

1. **Keep frontend on Vercel** (static hosting is excellent)
2. **Move backend to**:
   - Railway
   - Render
   - Fly.io
   - AWS ECS/Fargate
   - DigitalOcean App Platform

3. **Update API calls**:
   ```typescript
   // Before
   const API_URL = '/api';
   
   // After
   const API_URL = 'https://api.umrahops.com';
   ```

---

## Summary

This serverless setup provides:

✅ **Zero-config deployment** (push to deploy)  
✅ **Automatic scaling** (0 to millions)  
✅ **Global CDN** (fast worldwide)  
✅ **HTTPS by default**  
✅ **Preview deployments** (every PR)  

**Limitations**:
⚠️ Cold starts (500ms - 2s)  
⚠️ 10s timeout  
⚠️ Ephemeral filesystem  
⚠️ No WebSockets  

**Perfect for**: MVP, demos, low-traffic production apps  
**Not for**: High-traffic, real-time, long-running workloads

---

**Ready to deploy?**

```bash
npm run build && vercel --prod
```

**Questions?** Check Vercel docs: https://vercel.com/docs/functions
