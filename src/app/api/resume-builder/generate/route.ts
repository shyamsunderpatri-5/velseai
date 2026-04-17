import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateOptimizedResume } from "@/lib/resume-builder/generator";
import { ExtractedResumeSchema } from "@/lib/resume-builder/schemas";
import { captureServerEvent } from "@/lib/analytics/posthog.server";

const GenerateRequestSchema = z.object({
  extractedUserData: ExtractedResumeSchema,
  jobDescription: z.string().min(50, "Job description required"),
  missingKeywords: z.array(z.string()),
  targetCountry: z.enum(["usa_canada", "uk_australia", "germany_europe", "india", "middle_east", "international"]),
  templateStyle: z.string().optional(),
  targetAtsScore: z.number().min(80).max(100).optional().default(95)
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
    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    const startTime = Date.now();
    
    // Execute Groq Generation
    const optimizedResume = await generateOptimizedResume({
      extractedUserData: payload.extractedUserData,
      jobDescription: payload.jobDescription,
      missingKeywords: payload.missingKeywords,
      targetCountry: payload.targetCountry,
      templateStyle: payload.templateStyle,
      targetAtsScore: payload.targetAtsScore
    });
    
    const processingTime = Date.now() - startTime;

    await captureServerEvent("resume_generated", {
      distinctId: user.id,
      target_country: payload.targetCountry,
      processing_time_ms: processingTime
    });

    return NextResponse.json({
      success: true,
      data: optimizedResume,
      processingTime
    });

  } catch (error) {
    console.error("Resume Generation Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate optimized resume" },
      { status: 500 }
    );
  }
}
