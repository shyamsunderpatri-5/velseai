import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJSON } from "@/lib/ai";
import { getAuthenticityCheckPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, locale = "en" } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prompt = getAuthenticityCheckPrompt({ resumeText, locale });

    const result = await generateStructuredJSON<any>(
      prompt,
      {},
      { temperature: 0.2 }
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("Authenticity check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
