import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractResumeData } from "@/lib/resume-builder/extractor";
import { captureServerEvent } from "@/lib/analytics/posthog.server";

const RequestSchema = z.object({
  rawText: z.string().min(50, "Resume text must be at least 50 characters."),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to use the Resume Builder." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { rawText } = parsed.data;

    await captureServerEvent("resume_builder_started", {
      distinctId: user.id,
      action: "extraction_initiated"
    });

    const startTime = Date.now();
    
    // Execute Groq LPU Extraction
    const extractedData = await extractResumeData(rawText);
    
    const processingTime = Date.now() - startTime;

    await captureServerEvent("resume_extracted", {
      distinctId: user.id,
      processing_time_ms: processingTime,
      sections_found: Object.keys(extractedData).length
    });

    return NextResponse.json({
      success: true,
      data: extractedData,
      processingTime
    });

  } catch (error) {
    console.error("Extraction Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract resume data" },
      { status: 500 }
    );
  }
}
