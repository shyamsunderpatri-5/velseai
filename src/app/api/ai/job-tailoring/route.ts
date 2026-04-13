import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { getJobTailoringPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

const jobTailoringSchema = z.object({
  resumeText: z.string().min(100),
  jobDescription: z.string().min(100),
  locale: z.string().optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = jobTailoringSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeText, jobDescription, locale } = parsed.data;

    const prompt = getJobTailoringPrompt({
      resumeText,
      jobDescription,
      locale
    });

    const result = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 800,
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "job_tailoring",
        model_used: "ollama/openai",
      });
    }

    return NextResponse.json({
      success: true,
      result,
      processingTime: Date.now(),
    });
  } catch (error) {
    console.error("Job tailoring error:", error);
    return NextResponse.json(
      { error: "Failed to generate job tailoring suggestions" },
      { status: 500 }
    );
  }
}