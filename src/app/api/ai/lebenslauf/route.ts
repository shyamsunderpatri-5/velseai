import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";
import { getLebenslaufPrompt } from "@/lib/ai/prompts";
import { resumeJsonToPdfBuffer } from "@/lib/pdf/generator";

/**
 * POST /api/ai/lebenslauf
 *
 * Converts a user's resume into a German Lebenslauf format.
 * 
 * Steps:
 * 1. Load user's latest resume (or use provided JSON)
 * 2. GPT-4o adapts content to Lebenslauf structure
 * 3. pdf-lib generates a clean PDF
 * 4. Returns PDF as base64 + structured JSON
 *
 * Used by:
 *   - Resume builder → "Export as Lebenslauf" button
 *   - WhatsApp bot → user says "Lebenslauf erstellen"
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = z.object({
  resumeId: z.string().uuid().optional(),
  targetRole: z.string().min(1),
  targetCompany: z.string().min(1),
  returnPdf: z.boolean().optional().default(true),
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

    const { targetRole, targetCompany, returnPdf } = parsed.data;

    // ── Load resume ───────────────────────────────────────────────────────────
    const resumeQuery = parsed.data.resumeId
      ? supabase.from("resumes").select("content, title").eq("id", parsed.data.resumeId).eq("user_id", user.id).single()
      : supabase.from("resumes").select("content, title").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).single();

    const { data: resume } = await resumeQuery;

    if (!resume?.content) {
      return NextResponse.json(
        { error: "No resume found. Create a resume first." },
        { status: 404 }
      );
    }

    const resumeJson = resume.content as Record<string, unknown>;

    // ── GPT-4o: Adapt to Lebenslauf ───────────────────────────────────────────
    const prompt = getLebenslaufPrompt({
      resumeJson,
      targetRole,
      targetCompany,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const lebenslauf = JSON.parse(rawContent);

    // Track AI usage
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      feature: "lebenslauf",
      model_used: "gpt-4o",
      tokens_used: completion.usage?.total_tokens || 0,
    });

    // ── Generate PDF ──────────────────────────────────────────────────────────
    let pdfBase64: string | null = null;

    if (returnPdf) {
      try {
        // Map Lebenslauf structure to our PDF generator's ResumeContent format
        const pdfContent = {
          personal_info: {
            name: lebenslauf.persoenliche_daten?.name || "Kandidat",
            email: lebenslauf.persoenliche_daten?.email || "",
            phone: lebenslauf.persoenliche_daten?.telefon,
            location: lebenslauf.persoenliche_daten?.adresse,
          },
          summary: lebenslauf.profil,
          experience: (lebenslauf.berufserfahrung || []).map((e: Record<string, unknown>) => ({
            company: e.unternehmen as string || "",
            title: e.position as string || "",
            start_date: (e.zeitraum as string || "").split("–")[0]?.trim(),
            end_date: (e.zeitraum as string || "").split("–")[1]?.trim(),
            location: e.ort as string,
            bullets: (e.aufgaben as string[]) || [],
          })),
          education: (lebenslauf.ausbildung || []).map((e: Record<string, unknown>) => ({
            institution: e.institution as string || "",
            degree: e.abschluss as string || "",
            graduation_year: (e.zeitraum as string || "").split("–")[1]?.trim(),
            location: e.ort as string,
          })),
          skills: [
            ...(lebenslauf.edv_kenntnisse || []),
            ...(lebenslauf.sprachen || []),
          ],
        };

        const pdfBuffer = await resumeJsonToPdfBuffer(pdfContent, {
          template: "lebenslauf",
          locale: "de",
          accentColor: { r: 0.1, g: 0.1, b: 0.6 }, // Dark blue — professional German style
        });

        pdfBase64 = pdfBuffer.toString("base64");
      } catch (pdfErr) {
        console.error("[lebenslauf] PDF generation error:", pdfErr);
        // Non-fatal — still return JSON
      }
    }

    return NextResponse.json({
      success: true,
      lebenslauf,
      ...(pdfBase64 ? { pdf_base64: pdfBase64 } : {}),
    });

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/ai/lebenslauf] Error:", err);
    return NextResponse.json({ error: "Lebenslauf generation failed" }, { status: 500 });
  }
}
