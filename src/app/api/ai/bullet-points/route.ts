import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { getBulletPointPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

const bulletPointsSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  existingBullet: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  industry: z.string().optional(),
  resumeId: z.string().optional(),
  locale: z.string().optional().default('en'),
});

const BULLET_POINT_PROMPT = `You are an expert resume writer specializing in crafting impactful achievement statements.

Given the following information:
- Job Title: {jobTitle}
- Company: {company}
- Existing bullet (if any): {existingBullet}
- Keywords to include: {keywords}
- Industry: {industry}

Generate 3 improved achievement-based bullet points that:
1. Start with strong action verbs (Led, Managed, Developed, Created, Increased, Decreased, Improved, Achieved, Reduced, Launched, Designed, Built, Delivered, Organized, Coordinated, Analyzed, Optimized, Streamlined)
2. Include quantifiable results using numbers, percentages, or dollar amounts
3. Are under 150 characters each
4. Incorporate the provided keywords naturally if given
5. Highlight achievements over responsibilities

Format your response as a JSON array of strings:
["bullet 1", "bullet 2", "bullet 3"]

Only return the JSON array, nothing else.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bulletPointsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobTitle, company, existingBullet, keywords, industry, locale } = parsed.data;

    const prompt = getBulletPointPrompt({
      jobTitle,
      company: company || "",
      existingBullet,
      keywords,
      industry: industry || "General",
      locale
    });

    const result = await generateText(prompt, {
      temperature: 0.8,
      maxTokens: 300,
    });

    let bullets: string[] = [];
    try {
      bullets = JSON.parse(result);
      if (!Array.isArray(bullets)) {
        bullets = result.split("\n").filter((line: string) => line.trim());
      }
    } catch {
      bullets = result
        .replace(/^["']|["']$/g, "")
        .split(/\n|,/)
        .filter((line: string) => line.trim() && !line.match(/^\d+\.$/));
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("ai_usage").insert({
        user_id: user.id,
        feature: "bullet_points",
        model_used: "ollama/openai",
      });
    }

    return NextResponse.json({
      bullets: bullets.slice(0, 3),
      processingTime: Date.now(),
    });
  } catch (error) {
    console.error("Bullet points generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate bullet points" },
      { status: 500 }
    );
  }
}
