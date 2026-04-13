import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { getCareerAdvicePrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

const careerAdviceSchema = z.object({
  currentRole: z.string().min(2),
  yearsExperience: z.number().min(0).max(50),
  skills: z.array(z.string()).optional(),
  targetGoal: z.string().min(2),
  locale: z.string().optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = careerAdviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { currentRole, yearsExperience, skills, targetGoal, locale } = parsed.data;

    const prompt = getCareerAdvicePrompt({
      currentRole,
      yearsExperience,
      skills: skills || [],
      targetGoal,
      locale
    });

    const result = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "career_advice",
        model_used: "ollama/openai",
      });
    }

    return NextResponse.json({
      success: true,
      result,
      processingTime: Date.now(),
    });
  } catch (error) {
    console.error("Career advice error:", error);
    return NextResponse.json(
      { error: "Failed to generate career advice" },
      { status: 500 }
    );
  }
}