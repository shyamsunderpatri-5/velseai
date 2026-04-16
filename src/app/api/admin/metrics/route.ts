import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * VelseAI — Founder Metrics API
 * 
 * Fetches platform-wide KPIs for the admin dashboard.
 * Requires direct admin authorization.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // 1. Founder-Level Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email?.endsWith("@velseai.com")) {
     return NextResponse.json({ error: "Access Denied: Founder Integrity Protocol Violated" }, { status: 403 });
  }

  try {
    // 2. Call Platform Metrics RPC
    const { data: metrics, error } = await supabase.rpc("get_platform_metrics");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
