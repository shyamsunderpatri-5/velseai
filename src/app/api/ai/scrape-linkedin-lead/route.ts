import { NextRequest, NextResponse } from "next/server";
import { scrapeLinkedInJob } from "@/lib/scraper/linkedin";
import * as Sentry from "@sentry/nextjs";

/**
 * VelseAI — LinkedIn Job Intelligence API
 * 
 * POST /api/ai/scrape-linkedin-lead
 * Payload: { url: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes("linkedin.com/jobs")) {
      return NextResponse.json({ error: "Invalid LinkedIn Job URL" }, { status: 400 });
    }

    const data = await scrapeLinkedInJob(url).catch(err => {
      console.error("[Scraper API] Execution error:", err);
      throw err;
    });

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to extract market intelligence."
    }, { status: 500 });
  }
}
