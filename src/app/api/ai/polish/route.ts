import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithOpenAI } from "@/lib/ai/openai";

export async function POST(req: Request) {
  try {
    const { text, context } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = `You are an elite resume editor. Your task is to polish the provided text to make it professional, high-impact, and metric-driven.
Maintain the original meaning but improve wording, grammar, and impact.
STRICT INTEGRITY:
- NEVER add skills, tools, or technologies the user did not provide.
- NEVER invent new metrics, companies, or experience years.
- Only rephrase and strengthen what is ALREADY there.
- If the text is empty or nonsensical, return it unchanged.`;

CONTEXT: ${context || "Resume content"}

Return ONLY the polished text. No conversational filler.`;

    const polished = await generateWithOpenAI(`${systemPrompt}\n\nTEXT TO POLISH:\n${text}`, {
      model: "gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 300,
    });

    return NextResponse.json({ polished });
  } catch (error: any) {
    console.error("AI Polish error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to polish text" },
      { status: 500 }
    );
  }
}
