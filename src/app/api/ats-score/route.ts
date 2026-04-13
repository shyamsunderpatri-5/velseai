import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scoreResume } from "@/lib/ats/scorer";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/posthog";
import * as Sentry from "@sentry/nextjs";
import mammoth from "mammoth";

const atsScoreSchema = z.object({
  resumeText: z.string().optional(),
  resumeFile: z.string().optional(),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
});

async function extractTextFromFile(base64Data: string): Promise<string> {
  const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) {
    throw new Error("Invalid base64 format");
  }

  const mimeType = base64Match[1];
  const base64Content = base64Match[2];
  const buffer = Buffer.from(base64Content, "base64");

  if (mimeType === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = atsScoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeText: inputResumeText, resumeFile, jobDescription, companyName, jobTitle } = parsed.data;

    let resumeText = inputResumeText || "";

    if (!resumeText && resumeFile) {
      try {
        resumeText = await extractTextFromFile(resumeFile);
      } catch (extractError) {
        return NextResponse.json(
          { error: `Failed to parse file: ${extractError instanceof Error ? extractError.message : "Unknown error"}` },
          { status: 400 }
        );
      }
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Resume text is too short. Please provide more content (at least 50 characters)." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
    const userIp = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                   request.headers.get("x-real-ip") ||
                   "unknown";

    let userId: string | null = null;
    let userPlan = "free";
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
      
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan, plan_expires_at")
          .eq("id", userId)
          .single();
        
        if (profile) {
          userPlan = profile.plan || "free";
        }
      }
    } catch {
      // Not authenticated
    }

    const isSubscribed = userPlan !== "free" && userPlan !== "lifetime";
    const hasLifetimeAccess = userPlan === "lifetime";
    const canHaveUnlimited = isSubscribed || hasLifetimeAccess;

    // FREE PLAN: 3 checks LIFETIME per IP address (not per day)
    if (!canHaveUnlimited) {
      // Get or create IP-based record for LIFETIME tracking
      const { data: ipData } = await supabase
        .from("anonymous_ats_checks")
        .select("lifetime_checks")
        .eq("ip_address", userIp)
        .single();

      const lifetimeChecks = ipData?.lifetime_checks || 0;

      if (lifetimeChecks >= 3) {
        return NextResponse.json(
          {
            error: "Free limit reached",
            message: userId
              ? "You've used all 3 free checks (lifetime). Upgrade to Starter for unlimited checks."
              : "You've used all 3 free checks (lifetime). Sign up to continue checking.",
            remaining: 0,
            isLifetime: true,
          },
          { status: 429 }
        );
      }

      // Increment LIFETIME count (not daily)
      if (ipData) {
        await supabase
          .from("anonymous_ats_checks")
          .update({ 
            lifetime_checks: lifetimeChecks + 1,
            last_check_date: new Date().toISOString().split("T")[0]
          })
          .eq("ip_address", userIp);
      } else {
        await supabase.from("anonymous_ats_checks").insert({
          ip_address: userIp,
          lifetime_checks: 1,
          checks_today: 1,
          last_check_date: new Date().toISOString().split("T")[0],
        });
      }
    }

    const startTime = Date.now();
    const result = scoreResume(resumeText, jobDescription);
    const processingTime = Date.now() - startTime;

    const { data: savedScore, error: saveError } = await supabase
      .from("ats_scores")
      .insert({
        resume_id: null,
        user_id: userId,
        session_id: userId ? null : sessionId,
        job_description: jobDescription,
        company_name: companyName || null,
        job_title: jobTitle || null,
        overall_score: result.overall_score,
        keyword_score: result.keyword_score,
        format_score: result.format_score,
        experience_score: result.experience_score,
        skills_score: result.skills_score,
        missing_keywords: result.missing_keywords,
        matched_keywords: result.matched_keywords,
        suggestions: result.suggestions,
        resume_text: resumeText.slice(0, 5000),
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Failed to save ATS score:", saveError);
    }

    // Track successful ATS check
    await captureServerEvent("ats_check_completed", {
      distinctId: userId || sessionId,
      score: result.overall_score,
      keyword_score: result.keyword_score,
      format_score: result.format_score,
      skills_score: result.skills_score,
      experience_score: result.experience_score,
      anonymous: !userId,
      processing_time_ms: processingTime
    });

    // Get remaining checks for non-subscribed users
    let remainingChecks = 999;
    if (!canHaveUnlimited) {
      const { data: checkData } = await supabase
        .from("anonymous_ats_checks")
        .select("checks_today")
        .eq("ip_address", userIp)
        .single();
      remainingChecks = Math.max(0, 3 - (checkData?.checks_today || 0));
    }

    return NextResponse.json(
      {
        success: true,
        sessionId,
        scoreId: savedScore?.id,
        ...result,
        processingTime,
        unlimited: canHaveUnlimited,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(remainingChecks),
          "X-Processing-Time": String(processingTime),
        },
      }
    );
  } catch (error) {
    // Track failed ATS check
    await captureServerEvent("ats_check_failed", { 
      error: error instanceof Error ? error.message : "unknown" 
    });
    
    // Capture exception in Sentry
    Sentry.captureException(error);
    
    console.error("ATS scoring error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
