import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { getJDVisionPrompt } from "@/lib/ai/prompts";
import { JDExtractionSchema } from "@/lib/ai/structured-outputs";

/**
 * POST /api/jd-extraction
 *
 * Extracts structured job description data from:
 *   - image (base64 or URL) via GPT-4o vision
 *   - raw text (direct JD paste)
 *
 * Saves result to jd_extractions table.
 * Returns normalized JD data for use in ATS scoring, resume fix, job tracker.
 *
 * Used by:
 *   - Web UI: "Paste or upload JD" on ATS checker page
 *   - WhatsApp bot: image → this endpoint
 *   - Telegram bot: image → this endpoint
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
  mode: z.enum(["image", "text"]),
  imageBase64: z.string().optional(),      // data:image/jpeg;base64,...
  imageUrl: z.string().url().optional(),   // public image URL
  rawText: z.string().optional(),          // direct JD paste
  locale: z.string().optional().default("en"),
  saveToDb: z.boolean().optional().default(true),
  resumeId: z.string().uuid().optional(),  // if provided, compute match score too
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mode, imageBase64, imageUrl, rawText, locale, saveToDb, resumeId } = parsed.data;

    // ── Rate limiting (anonymous users) ──────────────────────────────────────
    if (!user) {
      // Allow anonymous JD extraction but limit to 3/hour via IP
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      const hourKey = `jd_extraction:${ip}:${new Date().getUTCHours()}`;

      const { count } = await supabase
        .from("anonymous_ats_checks")
        .select("id", { count: "exact" })
        .eq("ip_address", ip)
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if ((count || 0) >= 3) {
        return NextResponse.json(
          { error: "Rate limit reached. Sign up free for unlimited JD extractions." },
          { status: 429 }
        );
      }
    }

    let extractionResult;

    // ──────────────────────────────────────────────────────────────────────────
    // MODE: IMAGE — GPT-4o Vision
    // ──────────────────────────────────────────────────────────────────────────
    if (mode === "image") {
      if (!imageBase64 && !imageUrl) {
        return NextResponse.json(
          { error: "Provide imageBase64 or imageUrl for image mode" },
          { status: 400 }
        );
      }

      const imageContent = imageBase64
        ? { type: "image_url" as const, image_url: { url: imageBase64, detail: "high" as const } }
        : { type: "image_url" as const, image_url: { url: imageUrl!, detail: "high" as const } };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: getJDVisionPrompt(locale) },
              imageContent,
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const rawContent = completion.choices[0]?.message?.content || "{}";

      try {
        const parsed = JSON.parse(rawContent);
        extractionResult = JDExtractionSchema.parse(parsed);
      } catch (parseErr) {
        console.error("[jd-extraction] Parse error:", parseErr);
        return NextResponse.json(
          {
            error: "Could not extract JD from image. Try a clearer photo or paste the JD as text.",
            raw: rawContent.slice(0, 200),
          },
          { status: 422 }
        );
      }

      // Track AI usage
      if (user) {
        await supabase.from("ai_usage").insert({
          user_id: user.id,
          feature: "jd_vision",
          model_used: "gpt-4o",
          tokens_used: completion.usage?.total_tokens || 0,
        });
      }

    // ──────────────────────────────────────────────────────────────────────────
    // MODE: TEXT — extract structure from raw text (cheaper, gpt-4o-mini)
    // ──────────────────────────────────────────────────────────────────────────
    } else {
      if (!rawText || rawText.length < 50) {
        return NextResponse.json(
          { error: "rawText must be at least 50 characters" },
          { status: 400 }
        );
      }

      const textExtractionPrompt = `Extract structured job information from this job description text.
Return ONLY valid JSON matching this exact schema (null for missing fields):
{
  "company_name": "string",
  "job_title": "string",
  "location": "string or null",
  "salary_range": "string or null",
  "job_type": "full_time|part_time|contract|remote|hybrid|unknown",
  "required_skills": ["array"],
  "nice_to_have_skills": ["array"],
  "required_experience_years": "number or null",
  "education_requirement": "string or null",
  "key_responsibilities": ["array, max 8"],
  "benefits": ["array"],
  "application_deadline": "string or null",
  "contact_email": "string or null",
  "raw_text": "${rawText.slice(0, 100)}...",
  "confidence": 0.95,
  "language": "en|de|fr|es|hi|pt|ar|other"
}

JOB DESCRIPTION:
${rawText.slice(0, 4000)}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: textExtractionPrompt }],
        max_tokens: 1500,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const rawContent = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawContent);
      // Inject raw_text since model might truncate it
      parsed.raw_text = rawText.slice(0, 5000);
      extractionResult = JDExtractionSchema.parse(parsed);
    }

    // ── Save to DB ────────────────────────────────────────────────────────────
    let savedId: string | null = null;
    if (saveToDb) {
      const insertPayload = {
        user_id: user?.id || null,
        company_name: extractionResult.company_name,
        job_title: extractionResult.job_title,
        extracted_jd: extractionResult.raw_text,
        required_skills: extractionResult.required_skills,
        model_used: mode === "image" ? "gpt-4o" : "gpt-4o-mini",
        confidence_score: extractionResult.confidence,
      };

      const { data: saved } = await supabase
        .from("jd_extractions")
        .insert(insertPayload)
        .select("id")
        .single();

      savedId = saved?.id || null;
    }

    // ── Optionally compute match score ────────────────────────────────────────
    let matchScore = null;
    if (resumeId && user) {
      try {
        const matchRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/ai/match-score`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "" },
            body: JSON.stringify({
              resumeId,
              jobTitle: extractionResult.job_title,
              jobDescription: extractionResult.raw_text,
              requiredSkills: extractionResult.required_skills,
              locale,
            }),
          }
        );
        if (matchRes.ok) {
          matchScore = await matchRes.json();
        }
      } catch (matchErr) {
        console.error("[jd-extraction] Match score error:", matchErr);
      }
    }

    return NextResponse.json({
      success: true,
      extraction: extractionResult,
      extraction_id: savedId,
      match_score: matchScore,
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/jd-extraction] Error:", err);
    return NextResponse.json({ error: "JD extraction failed" }, { status: 500 });
  }
}
