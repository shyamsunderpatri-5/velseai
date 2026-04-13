import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { captureServerEvent } from "@/lib/analytics/posthog";

/**
 * POST /api/ai/cover-letter
 *
 * Generates a professional, ATS-optimized cover letter.
 * Supports: Standard (EN), Bewerbungsschreiben (DE), Lettre de motivation (FR).
 *
 * Used by:
 *   - Resume builder page (Cover Letter tab)
 *   - Job Detail Drawer (Generate Cover Letter button)
 *   - WhatsApp bot (future: "Send me a cover letter for this JD")
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
  resumeId: z.string().uuid().optional(),
  resumeText: z.string().optional(),
  jobTitle: z.string().min(1),
  companyName: z.string().min(1),
  jobDescription: z.string().min(50),
  tone: z.enum(["professional", "enthusiastic", "concise"]).optional().default("professional"),
  locale: z.enum(["en", "de", "fr", "es"]).optional().default("en"),
  userName: z.string().optional(),
  jobApplicationId: z.string().uuid().optional(),  // save cover letter back to job_applications
});

// ─── Locale-specific prompt ───────────────────────────────────────────────────

function buildCoverLetterPrompt(params: {
  resumeText: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  tone: string;
  locale: string;
  userName: string;
}): string {
  const { resumeText, jobTitle, companyName, jobDescription, tone, locale, userName } = params;

  const localeInstructions: Record<string, string> = {
    en: `Write in professional British/American English. Standard cover letter format.`,
    de: `Write in German. Follow the exact Bewerbungsschreiben format:
- Briefkopf (sender address top-right, recipient top-left, date)
- Betreffzeile: "Bewerbung als ${jobTitle}"
- Anrede: "Sehr geehrte Damen und Herren,"
- Einleitung (1 paragraph), Hauptteil (2-3 paragraphs), Schluss (1 paragraph)
- Formal closing: "Mit freundlichen Grüßen"
- Tone must be very formal (Sie-form, no contractions)`,
    fr: `Write in French. Follow the Lettre de motivation format:
- Objet: "Candidature au poste de ${jobTitle}"
- Formule d'appel: "Madame, Monsieur,"
- 3 paragraphs: motivation, compétences, conclusion
- Formal closing: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées."`,
    es: `Write in Spanish. Professional carta de presentación format.
- Formal opening: "Estimados miembros del equipo de ${companyName}:"
- 3 paragraphs: introducción, experiencia, cierre
- Formal closing: "Atentamente,"`,
  };

  const toneInstruction =
    tone === "concise"
      ? "Keep it under 250 words. Be direct."
      : tone === "enthusiastic"
      ? "Show genuine excitement. Use dynamic language. Still professional."
      : "Professional, confident, warm.";

  return `You are an elite career coach and cover letter writer.

${localeInstructions[locale] || localeInstructions.en}

Tone: ${toneInstruction}

CANDIDATE RESUME:
${resumeText.slice(0, 2500)}

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}
CANDIDATE NAME: ${userName}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Rules:
- Naturally incorporate 3-5 keywords from the job description
- Reference specific achievements from the resume with metrics
- Do NOT start with "I am writing to..."
- Do NOT use clichés like "I am a passionate team player"
- Make the opening sentence immediately compelling
- Keep ATS keywords visible but natural

Return ONLY a JSON object:
{
  "subject_line": "Email subject line if sending cold",
  "greeting": "Opening salutation",
  "body": "Full cover letter body (no HTML, use \\n for line breaks)",
  "closing": "Closing salutation + name",
  "ats_keywords_included": ["keyword1", "keyword2"],
  "word_count": 320,
  "locale_format": "en_standard|de_bewerbungsschreiben|fr_lettre_motivation|es_carta_presentacion|generic"
}`;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

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

    const { jobTitle, companyName, jobDescription, tone, locale, jobApplicationId } = parsed.data;

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("ai_usage")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("feature", "cover_letter")
      .gte("created_at", today);

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, full_name")
      .eq("id", user.id)
      .single();

    const dailyLimit = profile?.plan === "free" ? 1 : profile?.plan === "starter" ? 5 : 999;

    if ((count || 0) >= dailyLimit) {
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `Free plan: 1 cover letter/day. Upgrade for more.`,
          upgrade_url: "/pricing",
        },
        { status: 429 }
      );
    }

    // ── Load resume ───────────────────────────────────────────────────────────
    let resumeText = parsed.data.resumeText || "";

    if (parsed.data.resumeId && !resumeText) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("content")
        .eq("id", parsed.data.resumeId)
        .eq("user_id", user.id)
        .single();

      if (resume?.content) {
        const c = resume.content as Record<string, unknown>;
        const exp = (c.experience as { bullets?: string[]; company?: string; title?: string }[]) || [];
        resumeText = [
          c.summary || "",
          ...exp.flatMap((e) => [`${e.title} at ${e.company}`, ...(e.bullets || [])]),
          ((c.skills as string[]) || []).join(", "),
        ].filter(Boolean).join("\n");
      }
    }

    if (!resumeText) {
      // Try latest resume
      const { data: resume } = await supabase
        .from("resumes")
        .select("content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (resume?.content) {
        const c = resume.content as Record<string, unknown>;
        resumeText = [c.summary || "", ((c.skills as string[]) || []).join(", ")].filter(Boolean).join("\n");
      }
    }

    const userName = parsed.data.userName || profile?.full_name || "Candidate";

    // ── GPT-4o: Generate Cover Letter ─────────────────────────────────────────
    const prompt = buildCoverLetterPrompt({
      resumeText: resumeText || "No resume provided",
      jobTitle,
      companyName,
      jobDescription,
      tone,
      locale,
      userName,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      response_format: { type: "json_object" },
      temperature: 0.55,  // Slightly higher for more natural writing
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const coverLetter = JSON.parse(rawContent);

    // ── Track usage ───────────────────────────────────────────────────────────
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      feature: "cover_letter",
      model_used: "gpt-4o",
      tokens_used: completion.usage?.total_tokens || 0,
    });

    // ── Save cover letter to DB ───────────────────────────────────────────────
    const { data: savedCoverLetter } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        job_title: jobTitle,
        company_name: companyName,
        content: coverLetter.body,
        locale,
        full_output: coverLetter,
        job_application_id: jobApplicationId || null,
      })
      .select("id")
      .single();

    // Link to job application if provided
    if (jobApplicationId && savedCoverLetter?.id) {
      await supabase
        .from("job_applications")
        .update({ cover_letter_id: savedCoverLetter.id })
        .eq("id", jobApplicationId)
        .eq("user_id", user.id);
    }

    await captureServerEvent("cover_letter_generated", {
      distinctId: user.id,
      locale,
      tone,
      word_count: coverLetter.word_count || 0,
    });

    return NextResponse.json({
      success: true,
      cover_letter_id: savedCoverLetter?.id,
      ...coverLetter,
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/ai/cover-letter] Error:", err);
    return NextResponse.json({ error: "Cover letter generation failed" }, { status: 500 });
  }
}