import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/job-alerts
 *
 * Vercel cron entry point (runs daily at 07:00 UTC per vercel.json).
 * Simply calls /api/job-alerts/send with the CRON_SECRET header.
 *
 * Vercel cron: authenticated automatically via CRON_SECRET env var.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/job-alerts/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": process.env.CRON_SECRET!,
        },
      }
    );

    const result = await response.json();
    console.log("[cron/job-alerts] Result:", result);

    return NextResponse.json({
      success: true,
      triggered_at: new Date().toISOString(),
      result,
    });
  } catch (err) {
    console.error("[cron/job-alerts] Error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
