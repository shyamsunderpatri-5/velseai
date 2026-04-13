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
