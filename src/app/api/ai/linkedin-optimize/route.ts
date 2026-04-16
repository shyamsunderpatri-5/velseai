import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const linkedinSchema = z.object({
  jobDescriptions: z.array(z.string().min(50)).max(5, "Maximum 5 job descriptions at once"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = linkedinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobDescriptions } = parsed.data;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const combinedJds = jobDescriptions.join("\n\n--- NEXT JOB ---\n\n");

    const prompt = `You are a career consultant and LinkedIn optimization expert.
    
The user is targeting these multiple job descriptions simultaneously. Your goal is to find the "Universal Skill Union"—the keywords and skills that appear frequently across these JDs or are critical for these roles.

JOB DESCRIPTIONS:
${combinedJds}

Identify:
1. Top 15 Universal Skills: The most important keywords to have in the LinkedIn "Skills" section.
2. Summary Optimization: 3 specific phrases to include in their LinkedIn "About" section to match these roles.
3. Headline Recommendations: 3 variations of a high-impact headline.

Return ONLY a valid JSON object:
{
  "top_keywords": ["skill1", "skill2", ...],
  "about_phrases": ["phrase1", "phrase2", "phrase3"],
  "headline_variations": ["headline1", "headline2", "headline3"],
  "analysis_summary": "One sentence explaining why these keywords are critical for thisJD set."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return NextResponse.json(result);

  } catch (error) {
    console.error("LinkedIn optimization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
