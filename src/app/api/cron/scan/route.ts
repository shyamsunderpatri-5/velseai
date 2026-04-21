import { NextRequest, NextResponse } from "next/server";
import { runDiscoveryScan } from "@/lib/ats/scanner";

/**
 * Milestone 3: Discovery Scan Trigger (Cron)
 * This endpoint is called to refresh the "New Leads" inbox.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  // Security check: Only allow if Cron Secret matches or in development
  if (
    process.env.NODE_ENV === "production" && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized Protocol Breach", { status: 401 });
  }

  try {
    console.log("[Cron] Starting Automated Portal Scan...");
    const newLeadsCount = await runDiscoveryScan();
    
    return NextResponse.json({
      success: true,
      message: "Scan completed successfully",
      new_leads: newLeadsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Cron Fail]", error);
    return NextResponse.json({ error: "Scan sequence failed" }, { status: 500 });
  }
}
