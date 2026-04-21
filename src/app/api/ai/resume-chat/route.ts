import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithOpenAI } from "@/lib/ai/openai";
import { zodToJsonSchema, AIChatResponseSchema } from "@/lib/ai/structured-outputs";

export async function POST(req: Request) {
  try {
    const { message, context, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = `You are the VELSEAI Editor Core. You are an elite AI resume engineer (Ex-FAANG, Top Tier Recruiter).
Your goal is to transform the user's resume into a mission-critical, ATS-proof document.

You operate the resume state directly via SUGGESTED ACTIONS.

CURRENT RESUME CONTEXT (JSON):
${context || "No content provided."}

MISSION PROTOCOLS:
1. RESPONSE: Speak like an elite career architect. Concise, high-agency, professional.
2. ACTIONS: If the user asks for a change, generate the corresponding suggested_action.
3. QUALITY: Bullet points must be high-impact (Action Verb + Data/Metric + Result).
4. ATS: Ensure keywords from the resume context are semantically dense.
5. ZERO HALLUCINATION (STRICT): 
   - NEVER add new skills, tools, or technologies the user has not mentioned in the context.
   - NEVER invent experience, company names, or job titles.
   - NEVER fabricate metrics or percentages.
   - If information is missing to fulfill a request, ASK the user for the specific details rather than guessing.
   - If the user asks to "add React" but React is not in their context, you MUST inform them that you can only add skills they actually possess.

ACTION TYPES:
- UPDATE_PERSONAL: For summary, title, contact info.
- ADD_EXPERIENCE: For new roles (Only if the user provides the details).
- UPDATE_EXPERIENCE: For refining existing bullet points (MUST provide ID). NO fabrication of new facts.
- ADD_SKILL: For adding categories and skill lists (Only from user-provided data).

Always return a JSON object conforming to the schema.`;

    const conversationHistory = (history || []).slice(-10).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    const response = await generateWithOpenAI("", {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1000,
      // Pass the messages array directly instead of a single prompt
      // Note: I need to update generateWithOpenAI to accept messages OR handle it here
    });

    // Actually, I'll update the generateWithOpenAI to support JSON mode/schema
    // For now, I'll use a more direct OpenAI call if needed, but let's see if I can improve the wrapper
    
    // I will call OpenAI directly here to use the new structured outputs feature properly
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      response_format: { 
        type: "json_schema", 
        json_schema: {
          name: "resume_chat_response",
          schema: zodToJsonSchema(AIChatResponseSchema),
          strict: true
        }
      },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response" },
      { status: 500 }
    );
  }
}