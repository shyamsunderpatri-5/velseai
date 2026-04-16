import { NextRequest, NextResponse } from "next/server";
import { processJobBroadcasts } from "@/lib/jobs/broadcast-engine";
import * as Sentry from "@sentry/nextjs";

/**
 * VelseAI — Daily/Periodic Job Broadcast Cron
 * 
 * Target: CRON job (e.g., Vercel Cron or GitHub Action)
 * Route: /api/cron/process-job-alerts
 * Auth: CRON_SECRET header
 */

export async function GET(request: NextRequest) {
  // 1. Auth check for secure cron execution
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized Profile Trigger" }, { status: 401 });
  }

  try {
    const results = await processJobBroadcasts();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: results
    });

  } catch (error: any) {
    console.error("[Cron] Alert processing fault:", error);
    Sentry.captureException(error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
