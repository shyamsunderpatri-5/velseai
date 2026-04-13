import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { getJobMatchScorePrompt } from "@/lib/ai/prompts";
import { captureServerEvent } from "@/lib/analytics/posthog";

/**
 * POST /api/ai/match-score
 *
 * Compares a user's resume against a job description.
 * Returns match %, reasons, missing skills, and tailoring tips.
 *
 * Used by:
 * - Job discovery page (score external jobs vs user's resume)
 * - Job detail drawer (show match %)
 * - Add to Tracker (auto-score on import)
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
  resumeId: z.string().uuid().optional(),
  resumeText: z.string().optional(),
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(50),
  requiredSkills: z.array(z.string()).optional().default([]),
  locale: z.string().optional().default("en"),
  jobApplicationId: z.string().uuid().optional(), // save score back to DB
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
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobTitle, jobDescription, requiredSkills, locale, jobApplicationId } = parsed.data;
    let resumeText = parsed.data.resumeText || "";

    // ── Load resume from DB if resumeId provided ──────────────────────────────
    if (parsed.data.resumeId && !resumeText) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("content")
        .eq("id", parsed.data.resumeId)
        .eq("user_id", user.id)
        .single();

      if (resume?.content) {
        const content = resume.content as Record<string, unknown>;
        const exp = (content.experience as { bullets?: string[]; company?: string; title?: string }[]) || [];
        resumeText = [
          content.summary || "",
          ...exp.flatMap((e) => [
            `${e.title} at ${e.company}`,
            ...(e.bullets || []),
          ]),
          ((content.skills as string[]) || []).join(", "),
        ]
          .filter(Boolean)
          .join("\n");
      }
    }

    // ── Try to use user's latest resume if nothing provided ───────────────────
    if (!resumeText) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (resume?.content) {
        const content = resume.content as Record<string, unknown>;
        const skills = ((content.skills as string[]) || []).join(", ");
        resumeText = [content.summary, skills].filter(Boolean).join("\n");
      }
    }

    if (!resumeText || resumeText.length < 30) {
      return NextResponse.json(
        {
          match_score: 0,
          match_level: "poor",
          reasons: [],
          missing_skills: requiredSkills,
          matching_skills: [],
          recommendation: "Create a resume first to get a match score.",
          tailoring_tips: [],
          no_resume: true,
        },
        { status: 200 }
      );
    }

    // ── Ollama fallback for cost control on free tier ─────────────────────────
    // Note: Ollama doesn't support JSON mode, so we use GPT-4o-mini for match scoring
    const prompt = getJobMatchScorePrompt({
      resumeText: resumeText.slice(0, 3000),
      jobTitle,
      jobDescription: jobDescription.slice(0, 2000),
      requiredSkills,
      locale,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // cheaper model — match scoring doesn't need gpt-4o
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const matchResult = JSON.parse(rawContent);

    // ── Track AI usage ────────────────────────────────────────────────────────
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      feature: "match_score",
      model_used: "gpt-4o-mini",
      tokens_used: completion.usage?.total_tokens || 0,
    });

    // ── Save match score back to job_applications ─────────────────────────────
    if (jobApplicationId) {
      await supabase
        .from("job_applications")
        .update({
          match_score: matchResult.match_score,
          match_reasons: matchResult.reasons,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobApplicationId)
        .eq("user_id", user.id);
    }

    await captureServerEvent("job_match_scored", {
      distinctId: user.id,
      match_score: matchResult.match_score,
      match_level: matchResult.match_level,
    });

    return NextResponse.json({
      success: true,
      ...matchResult,
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/ai/match-score] Error:", err);
    return NextResponse.json({ error: "Match scoring failed" }, { status: 500 });
  }
}
