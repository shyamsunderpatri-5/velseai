import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeResume } from "@/lib/ats/engine";
import { createClient } from "@/lib/supabase/server";

const multiAtsScoreSchema = z.object({
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
  jobDescriptions: z.array(z.string().min(50)).max(5, "Maximum 5 job descriptions at once"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = multiAtsScoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeText, jobDescriptions } = parsed.data;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run analyses in parallel
    const analysisPromises = jobDescriptions.map(async (jd) => {
      try {
        const result = await analyzeResume(resumeText, jd);
        return {
          success: true,
          jobDescription: jd,
          ...result
        };
      } catch (err) {
        return {
          success: false,
          jobDescription: jd,
          error: err instanceof Error ? err.message : "Analysis failed"
        };
      }
    });

    const results = await Promise.all(analysisPromises);

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Multi-ATS scoring error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
