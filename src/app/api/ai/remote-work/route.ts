import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { getRemoteWorkOptimizationPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

const remoteWorkSchema = z.object({
  resumeText: z.string().min(100),
  jobDescription: z.string().min(100),
  locale: z.string().optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = remoteWorkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeText, jobDescription, locale } = parsed.data;

    const prompt = getRemoteWorkOptimizationPrompt({
      resumeText,
      jobDescription,
      locale
    });

    const result = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 600,
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "remote_work_optimization",
        model_used: "ollama/openai",
      });
    }

    return NextResponse.json({
      success: true,
      result,
      processingTime: Date.now(),
    });
  } catch (error) {
    console.error("Remote work optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize for remote work" },
      { status: 500 }
    );
  }
}