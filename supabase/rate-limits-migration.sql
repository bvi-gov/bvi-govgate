-- =============================================
-- BVI GovGate: rate_limits table migration
-- =============================================

-- Table to track rate limit counters
CREATE TABLE IF NOT EXISTS rate_limits (
  id            BIGSERIAL PRIMARY KEY,
  key           TEXT NOT NULL,
  ip            TEXT NOT NULL,
  count         INTEGER NOT NULL DEFAULT 1,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_end    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key)
);

-- Index for cleanup queries (remove expired windows)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_end ON rate_limits (window_end);

-- Auto-cleanup: delete expired rows older than 5 minutes
CREATE OR REPLACE FUNCTION clean_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_end < now();
END;
$$ LANGUAGE plpgsql;

-- Run cleanup periodically (called by the RPC function below)
-- Or schedule via pg_cron if available; for now we clean on each increment

-- ─── RPC: increment_rate_limit ─────────────────────────────────
-- Atomically increment or reset a rate-limit counter.
-- Returns the new count after increment.
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key         TEXT,
  p_ip          TEXT,
  p_window_end  TIMESTAMPTZ,
  p_max_requests INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_id BIGINT;
BEGIN
  -- Clean up expired entries (keeps table lean)
  DELETE FROM rate_limits WHERE window_end < now();

  -- Try to find existing entry
  SELECT id, count INTO v_id, v_count
    FROM rate_limits
    WHERE key = p_key
    FOR UPDATE;

  IF v_id IS NOT NULL THEN
    -- Entry exists: if window still active, increment; else reset
    IF rate_limits.window_end > now() THEN
      v_count := v_count + 1;
      UPDATE rate_limits SET count = v_count, updated_at = now() WHERE id = v_id;
    ELSE
      -- Window expired → reset
      v_count := 1;
      UPDATE rate_limits
        SET count = 1,
            window_start = now(),
            window_end = p_window_end,
            updated_at = now()
        WHERE id = v_id;
    END IF;
  ELSE
    -- No entry → insert
    v_count := 1;
    INSERT INTO rate_limits (key, ip, count, window_end)
      VALUES (p_key, p_ip, 1, p_window_end);
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_access" ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_no_access" ON rate_limits
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
