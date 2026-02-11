-- UmrahOps Supabase Schema - PostgreSQL
-- Production-ready schema for Supabase deployment with RLS policies
-- Mirrors shared/schema.ts with PostgreSQL safety and enhancements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === CORE TABLES ===

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Travelers
CREATE TABLE IF NOT EXISTS travelers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Core identity
  passport_number TEXT NOT NULL,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  dob DATE NOT NULL,
  
  -- Extensions
  phone TEXT,
  arrival_date DATE,
  departure_date DATE,
  flight_number TEXT,
  
  -- AI & Nusuk
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  risk_reason TEXT,
  nusuk_id TEXT,
  nusuk_status TEXT DEFAULT 'pending' CHECK (nusuk_status IN ('pending', 'accepted', 'rejected')),
  
  -- UI State
  overlay JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (Chain integrity)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB,
  payload_hash TEXT,
  prev_hash TEXT,
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs Queue
CREATE TABLE IF NOT EXISTS jobs_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todos (Rich objectives)
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES travelers(id) ON DELETE SET NULL,
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'system',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'archived')),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  urgency_score INTEGER,
  due_at TIMESTAMPTZ,
  assigned_to TEXT, -- User ID
  metadata JSONB DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'routine',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  template_text TEXT NOT NULL,
  variables JSONB, -- Array of strings
  stage TEXT,
  escalation_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boosts (AI Knowledge/Tips)
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  short_desc TEXT,
  content TEXT, -- Markdown
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Rules
CREATE TABLE IF NOT EXISTS chat_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_pattern TEXT NOT NULL,
  intent TEXT,
  response_text TEXT,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  action JSONB,
  priority INTEGER DEFAULT 100,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === INDEXES ===
CREATE INDEX IF NOT EXISTS idx_travelers_group ON travelers(group_id);
CREATE INDEX IF NOT EXISTS idx_travelers_nusuk ON travelers(nusuk_status);
CREATE INDEX IF NOT EXISTS idx_todos_group ON todos(group_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- === ROW LEVEL SECURITY (RLS) ===
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rules ENABLE ROW LEVEL SECURITY;

-- Simple "Authenticated Only" policies for MVP
-- In production, these should be scoped by organization_id or created_by
CREATE POLICY "Authenticated users can CRUD groups" ON groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD travelers" ON travelers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD hotels" ON hotels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD jobs" ON jobs_queue FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD todos" ON todos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD message_templates" ON message_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD boosts" ON boosts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can CRUD chat_rules" ON chat_rules FOR ALL USING (auth.role() = 'authenticated');

-- === VIEWS ===
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM groups) as total_groups,
  (SELECT COUNT(*) FROM travelers) as total_travelers,
  (SELECT COUNT(*) FROM jobs_queue WHERE status = 'pending') as pending_jobs,
  (SELECT COUNT(*) FROM todos WHERE status = 'open') as open_tasks;

-- === COMMENTS ===
COMMENT ON TABLE audit_logs IS 'Tamper-evident system trail';
COMMENT ON COLUMN audit_logs.hash IS 'SHA-256(prev_hash + payload_hash + timestamp)';
