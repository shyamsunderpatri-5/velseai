import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { message, context, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = await createClient();
    await supabase.auth.getUser();

    const systemPrompt = `You are an expert resume writer and career coach. Your role is to help users improve their resumes.

CONTEXT: ${context || "No resume context provided yet."}

Guidelines:
- Be specific and actionable in your suggestions
- Focus on achievements and quantifiable results
- Keep suggestions concise and practical
- If the user asks about formatting, suggest ATS-friendly plain text
- Never make up details - ask for clarification if needed
- Use bullet points for readability
- Always maintain a professional, encouraging tone

You can help with:
1. Professional summaries
2. Achievement bullet points
3. Skills suggestions
4. Grammar and clarity fixes
5. ATS optimization
6. Action verbs and power words
7. Quantifying accomplishments
8. Formatting advice

Respond in a helpful, concise manner.`;

    const conversationHistory = [
      ...(history || []).slice(-6).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ].map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");

    const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory}`;

    const response = await generateText(fullPrompt, {
      temperature: 0.7,
      maxTokens: 800,
    });

    return NextResponse.json({
      response,
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response" },
      { status: 500 }
    );
  }
}