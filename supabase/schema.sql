-- =============================================
-- SELVO - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- MIGRATION 001: Core Tables
-- =============================================

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'lifetime')),
  plan_expires_at TIMESTAMPTZ,
  razorpay_customer_id TEXT,
  stripe_customer_id TEXT,
  ats_checks_used INT DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  referred_by UUID REFERENCES profiles(id),
  free_months_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled Resume',
  template_id TEXT DEFAULT 'modern',
  is_public BOOLEAN DEFAULT FALSE,
  public_slug TEXT UNIQUE,
  target_role TEXT,
  target_industry TEXT,
  last_ats_score INT,
  content JSONB NOT NULL DEFAULT '{
    "personal": {},
    "summary": "",
    "experience": [],
    "education": [],
    "skills": [],
    "projects": [],
    "certifications": [],
    "languages": [],
    "achievements": []
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATS Score History
CREATE TABLE IF NOT EXISTS ats_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  job_description TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  overall_score INT NOT NULL,
  keyword_score INT,
  format_score INT,
  experience_score INT,
  skills_score INT,
  missing_keywords TEXT[],
  matched_keywords TEXT[],
  suggestions JSONB,
  resume_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications Tracker
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  job_description TEXT,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_date DATE,
  follow_up_date DATE,
  salary_min INT,
  salary_max INT,
  location TEXT,
  job_type TEXT,
  notes TEXT,
  ats_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cover Letters
CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  job_application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions / Payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_gateway TEXT NOT NULL CHECK (payment_gateway IN ('razorpay', 'stripe')),
  gateway_payment_id TEXT,
  gateway_order_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'refunded')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous ATS Check Rate Limiting
CREATE TABLE IF NOT EXISTS anonymous_ats_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  checks_today INT DEFAULT 1,
  last_check_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Usage Tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  model_used TEXT,
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Queue for async email sending
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INT DEFAULT 0,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MIGRATION 002: Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_ats_checks ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Resumes: users can CRUD their own resumes; public resumes readable by all
CREATE POLICY "Users can CRUD own resumes" ON resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public resumes are viewable" ON resumes FOR SELECT USING (is_public = TRUE);

-- ATS Scores: users see own scores, anonymous scores via session
CREATE POLICY "Users can view own ATS scores" ON ats_scores FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert ATS scores" ON ats_scores FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Job Applications: users see own applications
CREATE POLICY "Users can CRUD own job applications" ON job_applications FOR ALL USING (auth.uid() = user_id);

-- Cover Letters: users see own cover letters
CREATE POLICY "Users can CRUD own cover letters" ON cover_letters FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: users see own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- AI Usage: users see own usage
CREATE POLICY "Users can view own AI usage" ON ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI usage" ON ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email Queue: service role only
CREATE POLICY "Service role can manage email queue" ON email_queue FOR ALL USING (auth.jwt() IS NOT NULL);

-- Anonymous ATS checks: service role only
CREATE POLICY "Service role can manage anonymous checks" ON anonymous_ats_checks FOR ALL USING (auth.jwt() IS NOT NULL);

-- =============================================
-- MIGRATION 003: Trigger to auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- MIGRATION 004: Auto-update updated_at timestamp
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION 005: Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_resume_id ON ats_scores(resume_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_user_id ON ats_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_anonymous_ats_ip ON anonymous_ats_checks(ip_address, last_check_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);

-- =============================================
-- MIGRATION 006: Enable Realtime (optional)
-- =============================================

-- ALTER PUBLICATION supabase_realtime ADD TABLE resumes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;

-- =============================================
-- MIGRATION 007: Job Alerts (Phase 2 scaffolding)
-- =============================================

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

-- =============================================
-- MIGRATION 008: WhatsApp Integration (Phase 3 scaffolding)
-- =============================================

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'button_reply')),
  content TEXT,
  media_url TEXT,
  wa_message_id TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);

-- =============================================
-- MIGRATION 009: JD Photo Extraction (Phase 4 scaffolding)
-- =============================================

CREATE TABLE IF NOT EXISTS jd_extractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  extracted_jd TEXT,
  company_name TEXT,
  job_title TEXT,
  required_skills TEXT[],
  model_used TEXT,
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jd_extractions_user_id ON jd_extractions(user_id);

-- =============================================
-- MIGRATION 010: Fix anonymous_ats_checks — add lifetime_checks column
-- (The /api/ats-score route already references this column)
-- =============================================

ALTER TABLE anonymous_ats_checks
  ADD COLUMN IF NOT EXISTS lifetime_checks INT DEFAULT 0;

-- =============================================
-- MIGRATION 011: User Job Preferences
-- Personalized job discovery: locations, skills, salary, job type.
-- Auto-populated from resume JSON on first ATS check.
-- =============================================

CREATE TABLE IF NOT EXISTS user_job_preferences (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Preferred locations (e.g. ['Berlin', 'Remote', 'Munich'])
  locations     TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Skills extracted from resume or manually added
  skills        TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Target roles / titles
  target_roles  TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Salary expectations
  salary_min    INT,
  salary_max    INT,
  salary_currency TEXT DEFAULT 'USD',
  -- Job type preference
  job_type      TEXT DEFAULT 'any' CHECK (job_type IN ('any', 'full_time', 'part_time', 'contract', 'remote', 'hybrid')),
  -- Email alert preferences
  alert_email   BOOLEAN DEFAULT TRUE,
  alert_whatsapp BOOLEAN DEFAULT FALSE,
  alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('daily', 'weekly', 'never')),
  -- TheirStack-compatible industry filter
  industries    TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_job_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own job preferences" ON user_job_preferences FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_job_preferences_user_id ON user_job_preferences(user_id);

CREATE TRIGGER update_user_job_preferences_updated_at
  BEFORE UPDATE ON user_job_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION 012: Cached Recent Jobs
-- 24-hour cache of TheirStack/external job results.
-- Reduces API calls and improves response time.
-- Cache key = location + skills hash. Expires via expires_at.
-- =============================================

CREATE TABLE IF NOT EXISTS cached_recent_jobs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Composite cache key: hash of location+skills filter
  cache_key       TEXT NOT NULL UNIQUE,
  -- Raw API response from TheirStack (array of job objects)
  jobs_data       JSONB NOT NULL DEFAULT '[]',
  -- Location filter used to fetch these jobs
  location        TEXT,
  -- Skills filter used
  skills          TEXT[],
  -- Number of jobs in this cache entry
  job_count       INT DEFAULT 0,
  -- API source used (theirstack, adzuna, remotive, mock)
  source          TEXT DEFAULT 'theirstack',
  -- Cache expiry — checked before serving
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS — this is read by all authenticated users, written by service role
ALTER TABLE cached_recent_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read job cache" ON cached_recent_jobs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role manages job cache" ON cached_recent_jobs FOR ALL USING (auth.jwt() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_cached_recent_jobs_cache_key ON cached_recent_jobs(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_recent_jobs_expires_at ON cached_recent_jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_cached_recent_jobs_location ON cached_recent_jobs(location);

-- =============================================
-- MIGRATION 013: Messaging Sessions
-- Unified bot state machine for WhatsApp + Telegram
-- Tracks conversation context so the bot knows what step the user is on
-- =============================================

CREATE TABLE IF NOT EXISTS messaging_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Link to platform-specific tables
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- Platform identifier
  platform        TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  -- Platform-specific identifier (phone for WA, chat_id for Telegram)
  platform_id     TEXT NOT NULL,
  -- Bot conversation state machine
  -- States: idle | awaiting_jd_photo | processing_jd | awaiting_resume_choice | sending_resume
  state           TEXT DEFAULT 'idle',
  -- Contextual data persisted between messages (JD extraction, resume choice, etc.)
  context         JSONB DEFAULT '{}',
  -- Last WhatsApp/Telegram message_id (for idempotency / deduplication)
  last_message_id TEXT,
  -- Whether this session is actively linked to a VelseAI account
  is_verified     BOOLEAN DEFAULT FALSE,
  -- When we last heard from this user
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  -- One active session per platform + platform_id
  UNIQUE(platform, platform_id)
);

ALTER TABLE messaging_sessions ENABLE ROW LEVEL SECURITY;
-- Users can only see their own sessions
CREATE POLICY "Users can view own messaging sessions" ON messaging_sessions FOR SELECT USING (auth.uid() = user_id);
-- Service role handles all writes (webhook runs as service role)
CREATE POLICY "Service role manages messaging sessions" ON messaging_sessions FOR ALL USING (auth.jwt() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_messaging_sessions_user_id ON messaging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messaging_sessions_platform ON messaging_sessions(platform, platform_id);
CREATE INDEX IF NOT EXISTS idx_messaging_sessions_last_active ON messaging_sessions(last_active_at);

CREATE TRIGGER update_messaging_sessions_updated_at
  BEFORE UPDATE ON messaging_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION 014: Job Applications — add cover_letter_id and source_job_id
-- cover_letter_id: link to a cover_letter generated for this application
-- source_job_id: if this job came from cached_recent_jobs, track origin
-- external_job_id: the TheirStack/external job board ID
-- =============================================

ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'theirstack', 'whatsapp', 'telegram')),
  ADD COLUMN IF NOT EXISTS external_job_id TEXT,
  ADD COLUMN IF NOT EXISTS match_score INT,
  ADD COLUMN IF NOT EXISTS match_reasons JSONB;

CREATE INDEX IF NOT EXISTS idx_job_applications_source ON job_applications(source);

-- =============================================
-- MIGRATION 015: Enable Realtime for live Kanban updates
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE messaging_sessions;

