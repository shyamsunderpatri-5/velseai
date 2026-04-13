-- Migration: Add lifetime_checks column and user_ip_tracking table
-- Run this in your Supabase SQL Editor

-- 1. Add lifetime_checks column to anonymous_ats_checks (for free users - 3 checks LIFETIME)
ALTER TABLE anonymous_ats_checks 
ADD COLUMN IF NOT EXISTS lifetime_checks INTEGER DEFAULT 0;

-- 2. Create user IP tracking table (to detect account sharing)
CREATE TABLE IF NOT EXISTS user_ip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_ip_tracking_user ON user_ip_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ip_tracking_ip ON user_ip_tracking(ip_address);

-- 4. Add RLS policies
ALTER TABLE user_ip_tracking ENABLE ROW LEVEL SECURITY;

-- Users can see their own IP records
CREATE POLICY "Users can view own IPs" ON user_ip_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access" ON user_ip_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- 5. Function to check IP sharing
CREATE OR REPLACE FUNCTION check_ip_sharing(user_uuid UUID)
RETURNS TABLE(ip_address TEXT, first_seen TIMESTAMPTZ, times_used INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uit.ip_address,
    uit.first_seen,
    COUNT(*)::INT as times_used
  FROM user_ip_tracking uit
  WHERE uit.user_id = user_uuid
  GROUP BY uit.ip_address, uit.first_seen
  ORDER BY times_used DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
