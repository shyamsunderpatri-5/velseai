import { NextRequest, NextResponse } from "next/server";
import { getOutreachPrompt } from "@/lib/ai/prompts";
import { getGroqCompletion } from "@/lib/ai/groq";

export async function POST(request: NextRequest) {
  try {
    const { type, jobTitle, companyName } = await request.json();

    // In a real scenario, we'd fetch candidate name and highlights from DB
    const prompt = getOutreachPrompt(
      "The Candidate", // Placeholder - should be from session/profile
      "Hiring Team",
      type,
      jobTitle,
      companyName,
      ["5+ years of ML experience", "Ex-Founder scaling systems to 1M users", "Deep expertise in Agentic Workflows"]
    );

    const completion = await getGroqCompletion(prompt, { jsonMode: true });
    
    try {
      const parsed = JSON.parse(completion);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ message: completion.replace(/[{}\n"]/g, "").trim() });
    }
  } catch (error) {
    console.error("[Outreach API Error]", error);
    return NextResponse.json({ error: "Failed to generate outreach pulse." }, { status: 500 });
  }
}
