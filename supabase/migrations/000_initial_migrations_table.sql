-- Migration: Create migrations tracking infrastructure
-- Run this ONCE in Supabase SQL Editor first

-- 1. Create schema_migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create exec_sql function (if not exists)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- 3. Mark initial schema as applied
INSERT INTO schema_migrations (migration_id) VALUES ('001_initial_schema')
ON CONFLICT (migration_id) DO NOTHING;
