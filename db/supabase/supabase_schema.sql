-- UmrahOps Supabase Schema - PostgreSQL
-- Production-ready schema for Supabase deployment with RLS policies
-- This mirrors the SQLite schema but adds Postgres-specific enhancements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === CORE TABLES ===

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ext_agent TEXT, -- External/sub-agent identifier
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected')),
  steps_completed INTEGER DEFAULT 0 CHECK (steps_completed BETWEEN 0 AND 6),
  created_by TEXT, -- Agent ID from Supabase auth
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travelers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Core identity (PII)
  name TEXT NOT NULL,
  passport_number TEXT NOT NULL,
  passport_hash TEXT, -- SHA-256 hash for AI/logging (non-reversible)
  nationality TEXT NOT NULL,
  dob DATE NOT NULL,
  phone_e164 TEXT, -- E.164 format: +92XXXXXXXXXX
  
  -- Travel details
  arrival_date DATE,
  departure_date DATE,
  flight_number TEXT,
  
  -- Service assignments
  hotel_id UUID REFERENCES hotels(id),
  visa_program_id TEXT, -- NUSUK visa program identifier
  
  -- AI & automation
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  risk_reason TEXT,
  
  -- NUSUK integration
  nusuk_id TEXT,
  nusuk_status TEXT CHECK (nusuk_status IN ('pending', 'checking', 'approved', 'rejected', 'error')),
  nusuk_last_checked TIMESTAMPTZ,
  
  -- Messaging
  message_status TEXT DEFAULT 'not_sent' CHECK (message_status IN ('not_sent', 'prepared', 'sent', 'confirmed')),
  
  -- Paperwork tracking
  paperwork_status TEXT DEFAULT 'incomplete' CHECK (paperwork_status IN ('incomplete', 'in_progress', 'complete')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  rooms INTEGER DEFAULT 0,
  inventory JSONB DEFAULT '[]', -- [{roomType, count, pricePerNight}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES travelers(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES hotels(id),
  room_id TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT, -- Supabase auth user ID
  entity_type TEXT NOT NULL, -- 'group', 'traveler', 'booking', 'hotel'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'export', 'nusuk_check'
  payload JSONB, -- Changed data (should NOT contain raw PII)
  payload_hash TEXT, -- SHA-256 of payload for integrity
  prev_hash TEXT, -- Hash of previous log entry (chain integrity)
  hash TEXT, -- SHA-256(prev_hash + payload_hash + timestamp)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('nusuk_sync', 'ai_risk_batch', 'message_prepare', 'pdf_export')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- === INDEXES ===
CREATE INDEX IF NOT EXISTS idx_travelers_group_id ON travelers(group_id);
CREATE INDEX IF NOT EXISTS idx_travelers_passport_hash ON travelers(passport_hash);
CREATE INDEX IF NOT EXISTS idx_travelers_nusuk_status ON travelers(nusuk_status);
CREATE INDEX IF NOT EXISTS idx_travelers_risk_score ON travelers(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_dates ON bookings(hotel_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_status ON jobs_queue(status, type);

-- === TRIGGERS for updated_at ===
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travelers_updated_at BEFORE UPDATE ON travelers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- === ROW LEVEL SECURITY (RLS) ===
-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_queue ENABLE ROW LEVEL SECURITY;

-- Example policy: agents can read/write their own groups
-- Adjust based on your auth setup
CREATE POLICY "Agents can view their groups"
  ON groups FOR SELECT
  USING (created_by = auth.uid()::TEXT);

CREATE POLICY "Agents can create groups"
  ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid()::TEXT);

CREATE POLICY "Agents can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid()::TEXT);

-- Travelers inherit group permissions
CREATE POLICY "Agents can view travelers in their groups"
  ON travelers FOR SELECT
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid()::TEXT)
  );

CREATE POLICY "Agents can insert travelers in their groups"
  ON travelers FOR INSERT
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid()::TEXT)
  );

CREATE POLICY "Agents can update travelers in their groups"
  ON travelers FOR UPDATE
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid()::TEXT)
  );

-- Audit logs: read-only for logged actions
CREATE POLICY "Agents can view their audit logs"
  ON audit_logs FOR SELECT
  USING (agent_id = auth.uid()::TEXT);

-- Jobs queue: agents can view/update jobs they created
CREATE POLICY "Agents can view jobs"
  ON jobs_queue FOR SELECT
  USING (
    (payload->>'agentId')::TEXT = auth.uid()::TEXT
  );

-- Hotels and bookings: public read, restricted write
CREATE POLICY "All authenticated users can view hotels"
  ON hotels FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Agents can view bookings for their groups"
  ON bookings FOR SELECT
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid()::TEXT)
  );

-- === VIEWS (Optional) ===
-- Summary view for dashboard
CREATE OR REPLACE VIEW group_summary AS
SELECT 
  g.id,
  g.name,
  g.status,
  g.steps_completed,
  g.created_at,
  COUNT(t.id) AS traveler_count,
  AVG(t.risk_score) AS avg_risk_score,
  SUM(CASE WHEN t.nusuk_status = 'approved' THEN 1 ELSE 0 END) AS nusuk_approved_count,
  SUM(CASE WHEN t.message_status = 'sent' THEN 1 ELSE 0 END) AS messages_sent_count
FROM groups g
LEFT JOIN travelers t ON t.group_id = g.id
GROUP BY g.id, g.name, g.status, g.steps_completed, g.created_at;

-- === COMMENTS for documentation ===
COMMENT ON TABLE groups IS 'Main group/batch entity created by agents';
COMMENT ON TABLE travelers IS 'Individual pilgrims with PII stored securely; passport_hash used for external integrations';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail with chain-hash integrity (prev_hash links entries)';
COMMENT ON TABLE jobs_queue IS 'Background job queue for NUSUK sync, AI batching, messaging, exports';
COMMENT ON COLUMN travelers.passport_hash IS 'SHA-256 hash of passport_number; used for AI/logging without exposing raw PII';
COMMENT ON COLUMN audit_logs.hash IS 'SHA-256(prev_hash + payload_hash + timestamp) for tamper detection';
