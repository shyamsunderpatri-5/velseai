-- Migration: Create migrations tracking infrastructure
-- Run this ONCE in Supabase SQL Editor first

-- 1. Create schema_migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id TEXT UNIQUE NOT NULL,
  checksum TEXT,
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

-- 3. Mark initial schema as applied (checksum: 1a2b3c is for empty/initial schema)
INSERT INTO schema_migrations (migration_id, checksum) VALUES ('001_initial_schema', '1a2b3c')
ON CONFLICT (migration_id) DO NOTHING;
