import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredJSON } from "@/lib/ai";
import * as Sentry from "@sentry/nextjs";
import { getATSResumeFixPrompt } from "@/lib/ai/prompts";
import { captureServerEvent } from "@/lib/analytics/posthog.server";
import { generateWithGroq } from "@/lib/ai/groq";

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



const schema = z.object({
  mode: z.enum(["single_bullet", "full_resume"]).optional().default("full_resume"),
  // single_bullet mode fields
  bulletText: z.string().optional(),
  bulletContext: z.string().optional(), // "Role: SWE at Google. Focus on impact."
  // full_resume mode fields
  resumeId: z.string().uuid().optional(),
  resumeJson: z.record(z.string(), z.unknown()).optional(),
  resumeText: z.string().optional(),
  jobDescription: z.string().optional(),
  missingKeywords: z.array(z.string()).optional(),
  currentScore: z.number().int().min(0).max(100).optional().default(0),
  locale: z.string().optional().default("en"),
  returnPdf: z.boolean().optional().default(false),
  userId: z.string().uuid().optional(),
});

const ResumeFixResultSchema = z.object({
  improved_summary: z.string(),
  sections: z.array(z.object({
    section: z.string(),
    rewritten_content: z.string().optional().default("NA"),
    bullets: z.array(z.object({
      original: z.string(),
      rewritten: z.string(),
      improvement_reason: z.string(),
      keywords_added: z.array(z.string())
    })).optional()
  })),
  keywords_added: z.array(z.string()),
  estimated_new_score: z.number().int().min(0).max(100),
  changes_count: z.number().int().min(0)
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

    const { mode, resumeId, jobDescription, missingKeywords, currentScore, locale, returnPdf } = parsed.data;
    const effectiveUserId = user?.id || parsed.data.userId;

    // ── FAST PATH: Single Bullet Fix (Groq, ~300ms) ───────────────────────────
    if (mode === "single_bullet") {
      const { bulletText, bulletContext } = parsed.data;
      if (!bulletText || bulletText.trim().length < 5) {
        return NextResponse.json({ error: "bulletText is required for single_bullet mode" }, { status: 400 });
      }

      const bulletPrompt = `You are an elite resume writer. Rewrite this bullet point to be achievement-based, ATS-optimized, and start with a strong action verb.

Context: ${bulletContext || "Professional role"}
Original bullet: "${bulletText}"

Rules:
- Start with a strong action verb (Led, Built, Scaled, Reduced, Launched, Architected, Delivered)
- Include a quantifiable metric if possible (%, $, count, or estimate with ~)
- Max 2 lines. ATS-safe language. No buzzwords.
- Do NOT invent facts. Only rephrase and strengthen what's given.

Return ONLY valid JSON: { "rewritten": "the new bullet", "improvement": "one sentence explaining the key change" }`;

      // Use Groq for speed if available, else standard orchestrator
      let result = { rewritten: bulletText, improvement: "" };
      try {
        if (process.env.GROQ_API_KEY) {
          const raw = await generateWithGroq(bulletPrompt, {
            temperature: 0.3,
            maxTokens: 300,
            responseFormat: { type: "json_object" },
          });
          result = JSON.parse(raw);
        } else {
          result = await generateStructuredJSON<any>(bulletPrompt, {}, {
            temperature: 0.3,
            priority: "speed"
          });
        }
      } catch (e) {
        console.error("[fix-resume/single_bullet] AI error:", e);
        return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
      }

      // Track usage
      if (effectiveUserId) {
        await supabase.from("ai_usage").insert({
          user_id: effectiveUserId,
          feature: "fix_bullet",
          model_used: process.env.GROQ_API_KEY ? "groq" : "gpt-4o-mini",
          tokens_used: 0,
        }).catch(() => {}); // non-fatal
      }

      return NextResponse.json({
        success: true,
        original: bulletText,
        rewritten: result.rewritten || bulletText,
        improvement: result.improvement || "",
      });
    }

    // ── FULL RESUME MODE: Rate limiting check ─────────────────────────────────
    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json(
        { error: "jobDescription is required and must be at least 50 characters for full_resume mode" },
        { status: 400 }
      );
    }

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

      const dailyLimit = profile?.plan === "free" ? 10 : profile?.plan === "starter" ? 10 : 999;

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

    // ── Unified Orchestrator: Fix Resume (Automatic Fallback Groq/OpenAI) ─────
    const fixResult = await generateStructuredJSON<any>(prompt, ResumeFixResultSchema, {
      temperature: 0.3,
      priority: "speed" // Use Groq by default for high-speed synthesis
    });

    // ── Track AI usage ────────────────────────────────────────────────────────
    if (effectiveUserId) {
      await supabase.from("ai_usage").insert({
        user_id: effectiveUserId,
        feature: "fix_resume",
        model_used: process.env.GROQ_API_KEY ? "groq" : "openai",
        tokens_used: 0,
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
