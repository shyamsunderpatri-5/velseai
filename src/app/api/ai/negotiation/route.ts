import { NextRequest, NextResponse } from "next/server";
import { getNegotiationPrompt } from "@/lib/ai/prompts";
import { getGroqCompletion } from "@/lib/ai/groq";

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, companyName } = await request.json();

    const prompt = getNegotiationPrompt(
      jobTitle,
      companyName,
      "Senior / Staff", // Inferred from JD
      ["Experience in Finance Domain", "Spanish Language Proficiency"], // Gaps found by auditor
      ["Ex-Founder with exit", "7+ years scaling real-time systems", "Published Researcher in NLP"]
    );

    const completion = await getGroqCompletion(prompt, { jsonMode: true });
    
    try {
      const parsed = JSON.parse(completion);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ pivot: completion, founder_leverage: "", review_anchor: "" });
    }
  } catch (error) {
    console.error("[Negotiation API Error]", error);
    return NextResponse.json({ error: "Failed to synthesize negotiation leverage." }, { status: 500 });
  }
}
