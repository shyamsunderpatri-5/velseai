-- Migration: 006_network_domination
-- Date: 2026-04-15
-- Description: Profiles updates and bot extraction persistence for Phase 4

-- 1. Add messaging identifiers to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT UNIQUE;

-- 2. Create a generic bot_extractions table for both platforms
CREATE TABLE IF NOT EXISTS bot_extractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('whatsapp', 'telegram')) NOT NULL,
  source_id TEXT NOT NULL, -- Chat ID or Phone number
  job_title TEXT,
  company_name TEXT,
  location TEXT,
  salary_range TEXT,
  required_skills TEXT[],
  full_jd_text TEXT,
  raw_extraction JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_to_resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL
);

-- 3. External Jobs Cache (Scraped or sourced from APIs)
CREATE TABLE IF NOT EXISTS external_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT DEFAULT 'linkedin',
  external_id TEXT UNIQUE,
  url TEXT NOT NULL UNIQUE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  skills_required TEXT[],
  salary_info TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Match Results (Junction table for Alerts & Jobs)
CREATE TABLE IF NOT EXISTS alert_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES job_alerts(id) ON DELETE CASCADE,
  job_id UUID REFERENCES external_jobs(id) ON DELETE CASCADE,
  match_score INTEGER,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alert_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_extractions_user_id ON bot_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_extractions_source_id ON bot_extractions(source_id);
CREATE INDEX IF NOT EXISTS idx_external_jobs_is_processed ON external_jobs(is_processed);
CREATE INDEX IF NOT EXISTS idx_alert_matches_alert_id ON alert_matches(alert_id);

ALTER TABLE bot_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bot extractions" ON bot_extractions
  FOR ALL USING (auth.uid() = user_id);
