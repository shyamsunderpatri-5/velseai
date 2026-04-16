import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { getATSResumeFixPrompt } from "@/lib/ai/prompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bulkTailorSchema = z.object({
  resumeJson: z.record(z.string(), z.unknown()),
  jobDescriptions: z.array(z.string().min(50)).max(5, "Maximum 5 job descriptions at once"),
  locale: z.string().optional().default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bulkTailorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeJson, jobDescriptions, locale } = parsed.data;

    // Run tailoring in parallel
    const tailoringPromises = jobDescriptions.map(async (jd) => {
      try {
        // 1. Quick Keyword Extraction for this specific JD
        // (In a real scenario, we might want to run a full analysis first, but for bulk speed we do this)
        const jdWords = jd.toLowerCase().match(/\b[a-z][a-z0-9+#.]{2,}\b/g) || [];
        const keywords = [...new Set(jdWords)].slice(0, 10);

        const prompt = getATSResumeFixPrompt({
          resumeJson,
          jobDescription: jd,
          missingKeywords: keywords,
          currentScore: 0,
          locale,
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Using mini for bulk to handle rate limits and cost
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3000,
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const fixResult = JSON.parse(completion.choices[0]?.message?.content || "{}");
        
        return {
          success: true,
          jobDescription: jd,
          tailoredVariant: fixResult
        };
      } catch (err) {
        return {
          success: false,
          jobDescription: jd,
          error: err instanceof Error ? err.message : "Tailoring failed"
        };
      }
    });

    const results = await Promise.all(tailoringPromises);

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Bulk tailoring error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
