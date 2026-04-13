import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { getATSResumeFixPrompt } from "@/lib/ai/prompts";
import { captureServerEvent } from "@/lib/analytics/posthog";

/**
 * POST /api/ai/fix-resume
 *
 * Takes a resume + job description → rewrites bullets + summary to inject
 * missing keywords → returns improved text + optionally a PDF buffer.
 *
 * Used by:
 * - Dashboard ATS checker page ("Fix Resume" button)
 * - WhatsApp bot (after JD extraction, to generate tailored PDF)
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
  resumeId: z.string().uuid().optional(),
  resumeJson: z.record(z.string(), z.unknown()).optional(),
  resumeText: z.string().optional(),
  jobDescription: z.string().min(50, "Job description too short"),
  missingKeywords: z.array(z.string()).optional(),
  currentScore: z.number().int().min(0).max(100).optional().default(0),
  locale: z.string().optional().default("en"),
  returnPdf: z.boolean().optional().default(false),
  userId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeId, jobDescription, missingKeywords, currentScore, locale, returnPdf } = parsed.data;
    const effectiveUserId = user?.id || parsed.data.userId;

    // ── Rate limiting: check AI usage ─────────────────────────────────────────
    if (effectiveUserId) {
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("ai_usage")
        .select("id", { count: "exact" })
        .eq("user_id", effectiveUserId)
        .eq("feature", "fix_resume")
        .gte("created_at", today);

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", effectiveUserId)
        .single();

      const dailyLimit = profile?.plan === "free" ? 2 : profile?.plan === "starter" ? 10 : 999;

      if ((count || 0) >= dailyLimit) {
        return NextResponse.json(
          {
            error: "Daily limit reached",
            message: `You've used all ${dailyLimit} resume fixes today. Upgrade for more.`,
          },
          { status: 429 }
        );
      }
    }

    // ── Load resume data ──────────────────────────────────────────────────────
    let resumeJson: Record<string, unknown> = parsed.data.resumeJson || {};
    let resumeText = parsed.data.resumeText || "";

    if (resumeId && effectiveUserId) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("content, title")
        .eq("id", resumeId)
        .eq("user_id", effectiveUserId)
        .single();

      if (resume) {
        resumeJson = resume.content as Record<string, unknown>;
        // Convert content JSON to plain text if not provided
        if (!resumeText) {
          const exp = (resumeJson.experience as { bullets?: string[]; company?: string; title?: string }[]) || [];
          resumeText = [
            resumeJson.summary || "",
            ...exp.flatMap((e) => [
              `${e.title} at ${e.company}`,
              ...(e.bullets || []),
            ]),
            ...((resumeJson.skills as string[]) || []).join(", "),
          ]
            .filter(Boolean)
            .join("\n");
        }
      }
    }

    if (!resumeJson && !resumeText) {
      return NextResponse.json(
        { error: "No resume data provided. Pass resumeId, resumeJson, or resumeText." },
        { status: 400 }
      );
    }

    // ── Build keyword context from ATS scorer if not provided ────────────────
    let keywords = missingKeywords || [];
    if (keywords.length === 0 && resumeText) {
      // Quick keyword extraction from JD
      const jdWords = jobDescription
        .toLowerCase()
        .match(/\b[a-z][a-z0-9+#.]{2,}\b/g) || [];
      const resumeWords = new Set(resumeText.toLowerCase().split(/\s+/));
      keywords = [...new Set(jdWords)]
        .filter((w) => !resumeWords.has(w) && w.length > 3)
        .slice(0, 15);
    }

    // ── GPT-4o: Fix Resume ────────────────────────────────────────────────────
    const prompt = getATSResumeFixPrompt({
      resumeJson: Object.keys(resumeJson).length > 0 ? resumeJson : { raw_text: resumeText },
      jobDescription,
      missingKeywords: keywords,
      currentScore,
      locale,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      response_format: { type: "json_object" },
      temperature: 0.3, // Low temperature for consistent rewrites
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const fixResult = JSON.parse(rawContent);

    // ── Track AI usage ────────────────────────────────────────────────────────
    if (effectiveUserId) {
      await supabase.from("ai_usage").insert({
        user_id: effectiveUserId,
        feature: "fix_resume",
        model_used: "gpt-4o",
        tokens_used: completion.usage?.total_tokens || 0,
      });
    }

    await captureServerEvent("resume_fixed", {
      distinctId: effectiveUserId || "anonymous",
      keywords_added: fixResult.keywords_added?.length || 0,
      changes_count: fixResult.changes_count || 0,
      estimated_new_score: fixResult.estimated_new_score || 0,
    });

    // ── Optionally generate PDF ───────────────────────────────────────────────
    // (For WhatsApp bot — returnPdf=true)
    // PDF generation is handled via Puppeteer in a separate service
    // For now, return the JSON result; PDF generation TBD in Phase 2
    let pdfBuffer = null;
    if (returnPdf) {
      // TODO: Integrate Puppeteer PDF generation
      // pdfBuffer = await generateResumePdf({ ...resumeJson, ...fixResult });
      pdfBuffer = null;
    }

    return NextResponse.json({
      success: true,
      ...fixResult,
      resumeText: resumeText,
      jobTitle: jobDescription.split("\n")[0]?.slice(0, 80) || "Position",
      ...(pdfBuffer !== null ? { pdfBuffer } : {}),
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/ai/fix-resume] Error:", err);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}
