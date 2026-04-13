-- Migration: 004_job_alerts
-- Date: 2026-04-13
-- Description: Job Alerts table for Phase 2 (scaffolding)

CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  keywords TEXT[],
  locations TEXT[],
  job_boards TEXT[] DEFAULT ARRAY['linkedin', 'indeed', 'glassdoor', 'stepstone'],
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp', 'telegram')),
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);

ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own job alerts" ON job_alerts
  FOR ALL USING (auth.uid() = user_id);
