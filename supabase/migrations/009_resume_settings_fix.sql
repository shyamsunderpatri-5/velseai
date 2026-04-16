-- Migration: 009_resume_settings_fix
-- Date: 2026-04-15
-- Description: Ensures 'resumes' table has the necessary 'settings' column and other required fields.

DO $$
BEGIN
    -- 1. Add 'settings' column if it's missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'settings') THEN
        ALTER TABLE resumes ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 2. Add 'target_role' if it's missing (used in dashboard)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'target_role') THEN
        ALTER TABLE resumes ADD COLUMN target_role TEXT;
    END IF;

    -- 3. Add 'last_ats_score' if it's missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'last_ats_score') THEN
        ALTER TABLE resumes ADD COLUMN last_ats_score INTEGER;
    END IF;

    -- 4. Add 'is_public' if it's missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'is_public') THEN
        ALTER TABLE resumes ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
