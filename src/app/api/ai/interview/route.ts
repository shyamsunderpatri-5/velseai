import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { getTechnicalInterviewerPrompt, getTechnicalFeedbackPrompt } from "@/lib/ai/prompts";
import { captureServerEvent } from "@/lib/analytics/posthog";

/**
 * Technical Interview Engine
 * 
 * POST /api/ai/interview
 * 
 * Mode 1: "start" -> Initializes a session, returns the first question.
 * Mode 2: "chat"  -> Processes user answer, returns next challenge.
 * Mode 3: "finish" -> Generates final feedback and score.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
  mode: z.enum(["start", "chat", "finish"]),
  sessionId: z.string().uuid().optional(),
  
  // For "start"
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  jobDescription: z.string().optional(),
  difficulty: z.enum(["junior", "mid-level", "senior", "lead", "architect"]).optional().default("mid-level"),
  resumeId: z.string().uuid().optional(),

  // For "chat"
  userMessage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { mode, sessionId, jobTitle, companyName, jobDescription, difficulty, resumeId, userMessage } = parsed.data;

    // ──────────────────────────────────────────────────────────────────────────
    // MODE: START
    // ──────────────────────────────────────────────────────────────────────────
    if (mode === "start") {
      if (!jobTitle || !companyName || !jobDescription) {
        return NextResponse.json({ error: "jobTitle, companyName, and jobDescription are required to start" }, { status: 400 });
      }

      // Fetch resume context if provided
      let resumeContext = "";
      if (resumeId) {
        const { data: resume } = await supabase
          .from("resumes")
          .select("content")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .single();
        if (resume?.content) {
          const c = resume.content as any;
          resumeContext = `Skills: ${(c.skills || []).join(", ")}, Summary: ${c.summary || ""}`;
        }
      }

      // Create session
      const { data: session, error: sessionErr } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          company_name: companyName,
          job_description: jobDescription,
          difficulty,
          interview_type: "technical",
          status: "ongoing"
        })
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      // Get first question from AI
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const userName = profile?.full_name || "Candidate";

      const systemPrompt = getTechnicalInterviewerPrompt({
        jobTitle,
        companyName,
        jobDescription,
        difficulty,
        userName,
        resumeContext
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        temperature: 0.7,
      });

      const firstQuestion = completion.choices[0]?.message?.content || "Could you start by telling me about your experience with the core tech stack mentioned in the job description?";

      // Save messages
      await supabase.from("interview_messages").insert([
        { session_id: session.id, role: "system", content: systemPrompt },
        { session_id: session.id, role: "assistant", content: firstQuestion }
      ]);

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        message: firstQuestion
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MODE: CHAT
    // ──────────────────────────────────────────────────────────────────────────
    if (mode === "chat") {
      if (!sessionId || !userMessage) {
        return NextResponse.json({ error: "sessionId and userMessage required" }, { status: 400 });
      }

      // Load conversation history
      const { data: messages } = await supabase
        .from("interview_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!messages || messages.length === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Save user message
      await supabase.from("interview_messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage
      });

      // Get next challenge from AI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          ...messages.map(m => ({ role: m.role as any, content: m.content })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content || "That's interesting. Can you elaborate on the technical implementation details?";

      // Save assistant message
      await supabase.from("interview_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: assistantMessage
      });

      return NextResponse.json({
        success: true,
        message: assistantMessage
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MODE: FINISH
    // ──────────────────────────────────────────────────────────────────────────
    if (mode === "finish") {
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId required" }, { status: 400 });
      }

      const { data: session } = await supabase
        .from("interview_sessions")
        .select("*, messages:interview_messages(*)")
        .eq("id", sessionId)
        .single();

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Build transcript
      const transcript = (session.messages as any[])
        .filter(m => m.role !== "system")
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

      // Generate feedback
      const feedbackPrompt = getTechnicalFeedbackPrompt({
        jobTitle: session.job_title,
        transcript
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: feedbackPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const feedback = JSON.parse(completion.choices[0]?.message?.content || "{}");

      // Update session
      await supabase
        .from("interview_sessions")
        .update({
          status: "completed",
          overall_score: feedback.overall_score || 0,
          feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      await captureServerEvent("interview_completed", {
        distinctId: user.id,
        sessionId,
        score: feedback.overall_score,
        jobTitle: session.job_title
      });

      return NextResponse.json({
        success: true,
        feedback
      });
    }

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/ai/interview] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
