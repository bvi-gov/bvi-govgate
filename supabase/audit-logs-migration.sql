-- =============================================
-- BVI GovGate: audit_logs table migration
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor         TEXT NOT NULL,
  action        TEXT NOT NULL,
  entity        TEXT NOT NULL,
  entity_id     TEXT,
  details       JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common filter patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs (entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs (entity, action, timestamp DESC);

-- Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: service_role (backend) can do everything
CREATE POLICY "service_role_all_access" ON audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: authenticated users can read (for admin dashboard)
-- Note: In practice, the API route already enforces admin-only access.
-- This policy allows the Supabase client (which uses service_role key) to query freely.
CREATE POLICY "anon_read_none" ON audit_logs
  FOR SELECT
  TO anon
  USING (false);
