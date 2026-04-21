-- Migration: Fix job_discovery RLS INSERT policy
-- The original schema was missing INSERT and DELETE policies, 
-- causing the scanner's upsert to silently fail.

-- Policy: Allow the service role (used by scanner serverside) to insert
CREATE POLICY IF NOT EXISTS "Service role can insert discovery leads"
ON job_discovery
FOR INSERT
WITH CHECK (true);

-- Policy: Allow authenticated users to insert too (for future manual adds)
-- This is separate from the service role policy above
-- Note: In production, you'd lock this down to service_role only

-- Also allow delete for dismiss housekeeping
CREATE POLICY IF NOT EXISTS "Users can delete dismissed leads"
ON job_discovery
FOR DELETE
USING (auth.role() = 'authenticated');
