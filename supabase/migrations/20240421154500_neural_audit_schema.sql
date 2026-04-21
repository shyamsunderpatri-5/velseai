-- Migration: Neural Audit Schema
-- Adds multidimensional audit capabilities to the ATS scoring system.

ALTER TABLE ats_scores 
ADD COLUMN IF NOT EXISTS audit_score FLOAT,
ADD COLUMN IF NOT EXISTS audit_grade TEXT,
ADD COLUMN IF NOT EXISTS audit_report JSONB,
ADD COLUMN IF NOT EXISTS archetype TEXT,
ADD COLUMN IF NOT EXISTS legitimacy_tier TEXT;

COMMENT ON COLUMN ats_scores.audit_score IS 'Holistic 0.0-5.0 score from Neural Auditor';
COMMENT ON COLUMN ats_scores.audit_grade IS 'A-F grade for the job opportunity';
COMMENT ON COLUMN ats_scores.audit_report IS 'Full 10-dimension audit JSON output';
COMMENT ON COLUMN ats_scores.archetype IS 'Detected job persona (e.g. Scaling Unicorn, Early-Stage IC)';
COMMENT ON COLUMN ats_scores.legitimacy_tier IS 'Confidence in the job posting legitimacy';
