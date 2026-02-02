-- 20260202_final_schema.sql
-- Migration file for UmrahOps Demo Features
-- Target: SQLite (better-sqlite3) but compatible with Postgres conventions where possible

-- 1. Create table: todos (Replacing/Extending objectives)
CREATE TABLE IF NOT EXISTS todos (
  id text PRIMARY KEY,
  group_id text REFERENCES groups(id),
  traveler_id text REFERENCES travelers(id),
  hotel_id text REFERENCES hotels(id),
  booking_id text REFERENCES bookings(id),
  title text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'system', -- system | user
  status text NOT NULL DEFAULT 'open', -- open | in_progress | done | archived
  urgency text NOT NULL DEFAULT 'medium', -- low | medium | high
  urgency_score integer, -- 0-100
  due_at integer, -- timestamp
  assigned_to text,
  metadata text DEFAULT '{}', -- json string
  is_completed integer NOT NULL DEFAULT 0, -- boolean 0/1, backward compat
  type text NOT NULL DEFAULT 'routine', -- backward compat
  created_at integer DEFAULT (unixepoch())
);

-- 2. Create table: message_templates
CREATE TABLE IF NOT EXISTS message_templates (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  channel text NOT NULL DEFAULT 'whatsapp',
  template_text text NOT NULL,
  variables text, -- json string
  stage text,
  escalation_level integer DEFAULT 0,
  is_active integer DEFAULT 1, -- boolean 0/1
  created_at integer DEFAULT (unixepoch())
);

-- 3. Create table: boosts
CREATE TABLE IF NOT EXISTS boosts (
  id text PRIMARY KEY,
  title text NOT NULL,
  short_desc text,
  content text, -- Markdown
  category text,
  is_active integer DEFAULT 1, -- boolean 0/1
  created_at integer DEFAULT (unixepoch())
);

-- 4. Create table: chat_rules
CREATE TABLE IF NOT EXISTS chat_rules (
  id text PRIMARY KEY,
  trigger_pattern text NOT NULL,
  intent text,
  response_text text,
  template_id text REFERENCES message_templates(id),
  action text, -- json string
  priority integer DEFAULT 100,
  enabled integer DEFAULT 1, -- boolean 0/1
  created_at integer DEFAULT (unixepoch())
);

-- 5. Add overlay column to travelers (if not exists)
-- SQLite does not support IF NOT EXISTS for ADD COLUMN in all versions well, 
-- but Drizzle handles this via schema push. 
-- Raw SQL for manual execution:
ALTER TABLE travelers ADD COLUMN overlay text DEFAULT '{}';

-- Indexes (Optional for performance)
CREATE INDEX IF NOT EXISTS idx_todos_status_due ON todos (status, due_at);
CREATE INDEX IF NOT EXISTS idx_templates_stage ON message_templates (stage);
CREATE INDEX IF NOT EXISTS idx_chat_rules_intent ON chat_rules (intent);
