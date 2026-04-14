import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateChecksum(sql: string): string {
  let hash = 0;
  for (let i = 0; i < sql.length; i++) {
    const char = sql.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

interface Migration {
  id: string;
  sql: string;
  checksum?: string;
}

const MIGRATIONS: Migration[] = [
  {
    id: "001_initial_schema",
    sql: `-- Already applied via 000_initial_migrations_table.sql`
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
      CREATE POLICY "Users manage own job alerts" ON job_alerts FOR ALL USING (auth.uid() = user_id);
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
      CREATE POLICY "Users manage own whatsapp" ON whatsapp_subscriptions FOR ALL USING (auth.uid() = user_id);
    `
  }
];

MIGRATIONS.forEach(m => {
  m.checksum = generateChecksum(m.sql);
});

async function runMigrations() {
  const supabase = await createClient();
  
  try {
    const { data: applied, error: fetchError } = await supabase
      .from("schema_migrations")
      .select("migration_id, checksum");
    
    if (fetchError) {
      console.log("Migrations table not found:", fetchError.message);
      return;
    }
    
    const appliedMap = new Map(applied?.map(m => [m.migration_id, m.checksum]) || []);
    const results: string[] = [];
    
    for (const migration of MIGRATIONS) {
      const appliedChecksum = appliedMap.get(migration.id);
      
      if (!appliedChecksum) {
        console.log(`Running migration: ${migration.id}`);
        
        const statements = migration.sql
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith("--"));
        
        for (const stmt of statements) {
          try {
            await supabase.rpc("exec_sql", { sql: stmt });
          } catch (e: any) {
            console.error(`Error executing statement:`, e.message);
          }
        }
        
        await supabase.from("schema_migrations").insert({
          migration_id: migration.id,
          checksum: migration.checksum,
          applied_at: new Date().toISOString()
        });
        
        results.push(migration.id);
      } else if (appliedChecksum !== migration.checksum) {
        console.error(`Checksum mismatch for ${migration.id}! Expected ${migration.checksum}, got ${appliedChecksum}`);
      }
    }
    
    return results;
  } catch (e) {
    console.error("Migration error:", e);
    return [];
  }
}

export async function GET() {
  const results = await runMigrations();
  
  return NextResponse.json({
    success: true,
    applied: results,
    timestamp: new Date().toISOString()
  });
}
