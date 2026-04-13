import { createClient } from "@/lib/supabase/server";

const MIGRATIONS = [
  {
    id: "001_initial_schema",
    sql: `
      -- Initial schema - tables created via Supabase dashboard
    `
  },
  {
    id: "002_pricing_updates",
    sql: `
      ALTER TABLE anonymous_ats_checks ADD COLUMN IF NOT EXISTS lifetime_checks INTEGER DEFAULT 0;
      
      CREATE TABLE IF NOT EXISTS user_ip_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        ip_address TEXT NOT NULL,
        first_seen TIMESTAMPTZ DEFAULT NOW(),
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_ip_tracking_user ON user_ip_tracking(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_ip_tracking_ip ON user_ip_tracking(ip_address);
      
      ALTER TABLE user_ip_tracking ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view own IPs" ON user_ip_tracking;
      CREATE POLICY "Users can view own IPs" ON user_ip_tracking
        FOR SELECT USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Service role full access" ON user_ip_tracking;
      CREATE POLICY "Service role full access" ON user_ip_tracking
        FOR ALL USING (auth.role() = 'service_role');
      
      CREATE OR REPLACE FUNCTION check_ip_sharing(user_uuid UUID)
      RETURNS TABLE(ip_address TEXT, first_seen TIMESTAMPTZ, times_used INT) AS $$
      BEGIN
        RETURN QUERY
        SELECT uit.ip_address, uit.first_seen, COUNT(*)::INT as times_used
        FROM user_ip_tracking uit
        WHERE uit.user_id = user_uuid
        GROUP BY uit.ip_address, uit.first_seen
        ORDER BY times_used DESC;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    id: "003_user_ip_tracking",
    sql: `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_ip TEXT;
    `
  },
  {
    id: "004_job_alerts",
    sql: `
      CREATE TABLE IF NOT EXISTS job_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        keywords TEXT NOT NULL,
        location TEXT,
        frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      );
      
      CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON job_alerts(user_id);
      
      ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users manage own job alerts" ON job_alerts;
      CREATE POLICY "Users manage own job alerts" ON job_alerts
        FOR ALL USING (auth.uid() = user_id);
    `
  },
  {
    id: "005_whatsapp_integration",
    sql: `
      CREATE TABLE IF NOT EXISTS whatsapp_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        phone TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        otp_code TEXT,
        otp_expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_user ON whatsapp_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_subscriptions_phone ON whatsapp_subscriptions(phone);
      
      ALTER TABLE whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users manage own whatsapp" ON whatsapp_subscriptions;
      CREATE POLICY "Users manage own whatsapp" ON whatsapp_subscriptions
        FOR ALL USING (auth.uid() = user_id);
    `
  }
];

async function ensureMigrationsTable() {
  const supabase = await createClient();
  
  const { error } = await supabase.from("schema_migrations").select("id").limit(1);
  
  if (error?.code === "42P01") {
    console.log("Creating schema_migrations table...");
    await supabase.rpc("create_migrations_table", {});
  }
}

async function runMigrations() {
  const supabase = await createClient();
  
  try {
    const { data: applied, error: fetchError } = await supabase
      .from("schema_migrations")
      .select("migration_id");
    
    if (fetchError && fetchError.code !== "42P01") {
      console.log("Migrations table not found or error:", fetchError.message);
      return;
    }
    
    const appliedIds = new Set(applied?.map(m => m.migration_id) || []);
    
    for (const migration of MIGRATIONS) {
      if (!appliedIds.has(migration.id)) {
        console.log(`Running migration: ${migration.id}`);
        
        const statements = migration.sql
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith("--"));
        
        for (const stmt of statements) {
          const { error } = await supabase.rpc("exec_sql", { sql: stmt });
          
          if (error) {
            console.error(`Error in ${migration.id}:`, error.message);
          }
        }
        
        await supabase.from("schema_migrations").insert({
          migration_id: migration.id,
          applied_at: new Date().toISOString()
        });
        
        console.log(`Migration ${migration.id} completed`);
      }
    }
  } catch (e) {
    console.log("Auto-migration not available. Run SQL manually.");
  }
}

export async function initMigrations() {
  await runMigrations();
}
