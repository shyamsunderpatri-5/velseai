-- Migration: Interview Story Bank
-- Creates a persistent repository for STAR+R behavioral stories.

CREATE TABLE IF NOT EXISTS interview_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  task TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  reflection TEXT,
  themes TEXT[] DEFAULT '{}',
  is_master BOOLEAN DEFAULT false,
  source_report_id UUID REFERENCES ats_scores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and user lookup
CREATE INDEX IF NOT EXISTS idx_interview_stories_user_id ON interview_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_stories_themes ON interview_stories USING GIN (themes);

-- Row Level Security
ALTER TABLE interview_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stories" 
ON interview_stories 
FOR ALL 
USING (auth.uid() = user_id);

COMMENT ON TABLE interview_stories IS 'Persistent bank of STAR+R behavioral interview stories.';
