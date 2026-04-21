-- Migration: Job Discovery Schema
-- Stores job leads discovered by the background scanner.

CREATE TABLE IF NOT EXISTS job_discovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT NOT NULL UNIQUE,
  location TEXT,
  source TEXT DEFAULT 'portal_scanner',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'dismissed', 'pursued')),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexing for state-based queries
CREATE INDEX IF NOT EXISTS idx_job_discovery_status ON job_discovery(status);
CREATE INDEX IF NOT EXISTS idx_job_discovery_url ON job_discovery(job_url);

-- Row Level Security (Global discovery pool, but user actions are private?)
-- Actually, discovery is shared, but we might want to track which user saw what.
-- For now, let's keep it simple: A global pool of leads for the user.
ALTER TABLE job_discovery ENABLE ROW LEVEL SECURITY;

-- Assuming a single-user or organization-wide discovery for now.
-- Policy: Any authenticated user can see discovery leads.
CREATE POLICY "Users can view discovery leads" 
ON job_discovery 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update discovery lead status" 
ON job_discovery 
FOR UPDATE 
USING (auth.role() = 'authenticated');

COMMENT ON TABLE job_discovery IS 'Elite job leads discovered by the background portal scanner.';
