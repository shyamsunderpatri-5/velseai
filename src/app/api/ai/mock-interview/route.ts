import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithOpenAI } from "@/lib/ai";
import { z } from "zod";

/**
 * /api/ai/mock-interview — Elite Interview Simulation
 * 
 * Logic:
 * 1. Takes 'history', 'jobDescription', and 'resumeContent'
 * 2. If history is empty, it initializes the session with a strong opening question.
 * 3. If history exists, it critiques the last answer and asks the next logical question.
 * 4. Maintains a "Ruthless Recruiter" persona for maximum impact.
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, jobDescription, resumeContent } = await request.json();

    const systemPrompt = `
      You are an Elite Executive Recruiter at a top-tier tech firm (e.g., Jane Street, OpenAI, or Nvidia).
      Your goal is to conduct a high-pressure, insightful mock interview.
      
      CONTEXT:
      - Candidate Resume: ${JSON.stringify(resumeContent)}
      - Target Job: ${jobDescription}
      
      RULES:
      1. Stay in character. Be professional, direct, and slightly challenging.
      2. If this is the start (no previous messages), introduce yourself and ask a complex behavioral or technical question based on their resume vs the JD.
      3. If the candidate just answered, briefly critique their answer (internal thought or subtle feedback) and then pivot to the next question.
      4. Ask ONLY ONE question at a time.
      5. Focus on quantifiable impact and technical depth.
      
      FORMAT:
      Return your response as a natural conversational message.
    `;

    const response = await generateWithOpenAI(
      [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      "gpt-4o-mini"
    );

    return NextResponse.json({ message: response });

  } catch (error) {
    console.error("Interview Agent Error:", error);
    return NextResponse.json({ error: "Failed to connect to Interview Protocol" }, { status: 500 });
  }
}
