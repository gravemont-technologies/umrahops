# UmrahOps - Run Instructions

## Quick Start (Windows)

```powershell
# 1. Install dependencies
npm install

# 2. Copy and configure environment
copy .env.example .env
# Edit .env with your credentials (optional for local dev)

# 3. Initialize SQLite database
npm run db:init

# 4. Start development server
npm run dev
# Open http://localhost:5000
```

## Quick Start (macOS/Linux)

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your credentials (optional for local dev)

# 3. Initialize SQLite database
npm run db:init

# 4. Start development server
npm run dev
# Open http://localhost:5000
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (port 5000) |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run db:init` | Initialize SQLite database with migrations |
| `npm run db:push` | Push Drizzle schema changes |
| `npm run startup-check` | Validate environment configuration |
| `npm run check` | TypeScript type checking |

## Environment Variables

The app works with minimal config. For full features:

```bash
# Required for production auth
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Required for AI risk scoring (optional: uses mock mode without)
OPENAI_API_KEY=sk-...

# Local database path (auto-created)
SQLITE_PATH=./data/umrahops.db
```

## Troubleshooting

### "NODE_ENV is not recognized"
Fixed in v1.0 - we now use `cross-env`. Run `npm install` again.

### "Database is locked"
Another process holds a write lock. Stop dev server and restart.

### "Cannot find module 'better-sqlite3'"
Run `npm install` to install native dependencies.

### Port 5000 already in use
Kill existing process: `npx kill-port 5000`

## File Structure

```
umrahos-main/
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Landing, Dashboard, GroupDetail, etc.
│       └── components/  # Reusable UI components
├── server/              # Express backend
│   ├── services/        # AI, NUSUK, messaging services
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # SQLite operations
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Drizzle ORM schema
│   ├── canonical.ts     # CSV validation
│   └── routes.ts        # API contracts
├── db/
│   ├── migrations/      # SQLite migrations
│   └── supabase/        # PostgreSQL schema for Supabase
├── scripts/
│   ├── startupCheck.ts  # Env validation
│   └── rpa/             # NUSUK automation (local-only)
└── data/                # SQLite database (gitignored)
```

## For Supabase (Cloud Database)

1. Create Supabase project at https://app.supabase.com
2. Go to SQL Editor
3. Paste contents of `db/supabase/supabase_schema.sql`
4. Run the script
5. Get your URL and anon key from project settings
6. Update `.env` with credentials
7. Restart app

## Local-Only Tasks

NUSUK RPA automation and heavy processing must run locally:
- See `docs/manual_local_steps.md`
- See `scripts/rpa/README.md`
