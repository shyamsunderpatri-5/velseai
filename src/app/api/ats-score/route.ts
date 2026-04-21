import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeResume } from "@/lib/ats/engine";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/posthog.server";
import * as Sentry from "@sentry/nextjs";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import path from "path";
import { pathToFileURL } from "url";

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
    try {
      // Point PDF.js to the absolute file path of the worker script.
      // On Windows, ESM requires absolute paths to be valid file:// URLs.
      const workerPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
      const workerURL = pathToFileURL(workerPath).href;
      PDFParse.setWorker(workerURL);

      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      
      if (!result || !result.text) {
        throw new Error("No text content found in PDF");
      }
      
      // Always destroy to prevent memory leaks
      await parser.destroy();
      
      return result.text;
    } catch (pdfError) {
      console.error("PDF Parsing error:", pdfError);
      throw new Error(`PDF scan failed: ${pdfError instanceof Error ? pdfError.message : "Parsing error"}`);
    }
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
    let profile: any = null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
      
      if (userId) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("plan, plan_expires_at, full_name")
          .eq("id", userId)
          .single();
        
        if (profileData) {
          profile = profileData;
          userPlan = profileData.plan || "free";
        }
      }
    } catch {
      // Not authenticated
    }

    const isSubscribed = userPlan !== "free" && userPlan !== "lifetime";
    const hasLifetimeAccess = userPlan === "lifetime";
    const canHaveUnlimited = isSubscribed || hasLifetimeAccess;

    // FREE PLAN PROTOCOL
    if (!canHaveUnlimited) {
      // Get IP-based record for LIFETIME tracking
      const { data: ipData } = await supabase
        .from("anonymous_ats_checks")
        .select("lifetime_checks, user_id")
        .eq("ip_address", userIp)
        .single();

      const lifetimeChecks = ipData?.lifetime_checks || 0;
      
      // Strict GATING: Guest (5) vs Account (20) - Increased for Development
      const maxAllowed = userId ? 20 : 5;

      if (lifetimeChecks >= maxAllowed) {
        return NextResponse.json(
          {
            error: "Limit Reached",
            message: userId
              ? `You've used your ${maxAllowed} free account checks. Upgrade to Starter for unlimited scans.`
              : `You've used your ${maxAllowed} free guest checks. Sign up to unlock additional free scans.`,
            remaining: 0,
            isLifetime: true,
            needsAuth: !userId
          },
          { status: 403 }
        );
      }

      // Record telemetry and increment count
      if (ipData) {
        await supabase
          .from("anonymous_ats_checks")
          .update({ 
            lifetime_checks: lifetimeChecks + 1,
            user_id: ipData.user_id || userId,
            last_check_date: new Date().toISOString().split("T")[0]
          })
          .eq("ip_address", userIp);
      } else {
        await supabase.from("anonymous_ats_checks").insert({
          ip_address: userIp,
          user_id: userId,
          lifetime_checks: 1,
          checks_today: 1,
          last_check_date: new Date().toISOString().split("T")[0],
        });
      }
    }

    const analyzeResult = await analyzeResume(resumeText, jobDescription);
    const result = analyzeResult; // Alias for compatibility with existing code
    const processingTime = result.processingTime;

    // MAGIC IMPORT: Use the resumeId returned from the scan first, fallback to DB query
    let resumeId = null;
    if (userId) {
      try {
        // Find latest asset or create one
        const { data: latestResume } = await supabase
          .from("resumes")
          .select("id")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        resumeId = latestResume?.id;

        if (resumeId) {
          // Update existing asset
          await supabase
            .from("resumes")
            .update({
              last_ats_score: result.overall_score,
              updated_at: new Date().toISOString()
            })
            .eq("id", resumeId);
        } else {
          // Create brand new asset for first-time user
          const { data: newResume, error: insertError } = await supabase
            .from("resumes")
            .insert({
              user_id: userId,
              title: jobTitle || "Strategic Audit Asset",
              target_role: jobTitle || "Market Analysis Candidate",
              last_ats_score: result.overall_score,
              template_id: "modern",
              content: { 
                personalInfo: { fullName: profile?.full_name || "Protocol Alpha" },
                personal: { summary: "" },
                experience: [], 
                education: [], 
                skills: [] 
              },
              settings: { layout: "default" }
            })
            .select("id")
            .single();
          
          if (insertError) throw insertError;
          resumeId = newResume?.id;
        }
      } catch (resumeError) {
        console.error("VELSEAI Logic Fault: Failed to synchronize resume asset:", resumeError);
      }
    }

    const { data: savedScore, error: saveError } = await supabase
      .from("ats_scores")
      .insert({
        resume_id: resumeId, // Link to the asset
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
        resumeId,
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
