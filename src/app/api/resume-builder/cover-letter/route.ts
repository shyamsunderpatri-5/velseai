import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/resume-builder/cover-letter";
import { ExtractedResumeSchema } from "@/lib/resume-builder/schemas";
import { captureServerEvent } from "@/lib/analytics/posthog.server";

const CoverLetterRequestSchema = z.object({
  extractedUserData: ExtractedResumeSchema,
  jobDescription: z.string().min(50, "Job description required"),
  companyName: z.string().min(1, "Company name required"),
  targetCountry: z.enum(["usa_canada", "uk_australia", "germany_europe", "india", "middle_east", "international"]),
  tone: z.enum(["professional", "enthusiastic", "formal"])
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = CoverLetterRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const startTime = Date.now();
    
    // Execute Groq Generation
    const coverLetter = await generateCoverLetter({
      extractedUserData: payload.extractedUserData,
      jobDescription: payload.jobDescription,
      companyName: payload.companyName,
      targetCountry: payload.targetCountry,
      tone: payload.tone
    });
    
    const processingTime = Date.now() - startTime;

    await captureServerEvent("cover_letter_generated", {
      distinctId: user.id,
      tone: payload.tone,
      target_country: payload.targetCountry,
      processing_time_ms: processingTime
    });

    return NextResponse.json({
      success: true,
      data: coverLetter,
      processingTime
    });

  } catch (error) {
    console.error("Cover Letter Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate Cover Letter" },
      { status: 500 }
    );
  }
}
