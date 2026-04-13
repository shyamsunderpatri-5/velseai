import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { getInterviewQuestionsPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

const interviewQuestionsSchema = z.object({
  jobTitle: z.string().min(2),
  company: z.string().optional(),
  experience: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  locale: z.string().optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = interviewQuestionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobTitle, company, experience, skills, locale } = parsed.data;

    const prompt = getInterviewQuestionsPrompt({
      jobTitle,
      company: company || "",
      experience: experience || [],
      skills: skills || [],
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
        feature: "interview_questions",
        model_used: "ollama/openai",
      });
    }

    return NextResponse.json({
      success: true,
      result,
      processingTime: Date.now(),
    });
  } catch (error) {
    console.error("Interview questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}