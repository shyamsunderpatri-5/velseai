import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

const resumeSummarySchema = z.object({
  targetRole: z.string(),
  yearsExperience: z.number().optional(),
  topSkills: z.array(z.string()).optional(),
  experienceText: z.string().optional(),
  tone: z.enum(["professional", "creative", "technical", "executive"]).optional(),
  resumeId: z.string().optional(),
});

const RESUME_SUMMARY_PROMPT = `You are an expert resume writer. Generate a compelling professional summary for a resume.

Given the following information:
- Target Role: {targetRole}
- Years of Experience: {yearsExperience}
- Top Skills: {topSkills}
- Experience Summary: {experienceText}
- Tone: {tone}

Write a 3-4 sentence professional summary that:
1. Mentions the target role clearly
2. Quantifies experience when possible
3. Highlights the top 3 skills relevant to the role
4. Conveys enthusiasm and career direction
5. Is appropriate for the specified tone

Do NOT use first-person pronouns (no "I" or "my").
Keep it under 300 characters.

Return only the summary text, nothing else.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resumeSummarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetRole, yearsExperience, topSkills, experienceText, tone } =
      parsed.data;

    const prompt = RESUME_SUMMARY_PROMPT
      .replace("{targetRole}", targetRole)
      .replace(
        "{yearsExperience}",
        yearsExperience ? `${yearsExperience} years` : "several years"
      )
      .replace(
        "{topSkills}",
        topSkills?.length ? topSkills.slice(0, 5).join(", ") : "various technical and soft skills"
      )
      .replace(
        "{experienceText}",
        experienceText || "Professional experience in relevant field"
      )
      .replace("{tone}", tone || "professional");

    const summary = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 200,
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "resume_summary",
        model_used: "ollama/openai",
      });
    }

    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    console.error("Resume summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume summary" },
      { status: 500 }
    );
  }
}
