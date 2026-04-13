-- Migration: 003_add_user_ip_tracking
-- Date: 2026-04-13
-- Description: Add user IP tracking for share detection (Starter plan feature)

ALTER TABLE anonymous_ats_checks 
ADD COLUMN IF NOT EXISTS lifetime_checks INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS user_ip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ip_tracking_user ON user_ip_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ip_tracking_ip ON user_ip_tracking(ip_address);

ALTER TABLE user_ip_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own IPs" ON user_ip_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON user_ip_tracking
  FOR ALL USING (auth.role() = 'service_role');
