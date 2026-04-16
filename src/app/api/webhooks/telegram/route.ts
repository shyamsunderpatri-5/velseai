import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { JDExtractionSchema } from "@/lib/ai/structured-outputs";
import { getJDVisionPrompt, getTailorPrompt } from "@/lib/ai/prompts";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { resumeJsonToPdfBuffer } from "@/lib/pdf/generator";

/**
 * VelseAI — Telegram Bot Webhook v2.0
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Telegram send helpers ────────────────────────────────────────────────────

async function tgSendMessage(chatId: number, text: string, parseMode: "Markdown" | "HTML" = "Markdown"): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
    signal: AbortSignal.timeout(10000),
  });
}

async function tgSendInlineKeyboard(
  chatId: number,
  text: string,
  buttons: { text: string; callback_data: string }[][]
): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }),
    signal: AbortSignal.timeout(10000),
  });
}

async function tgSendDocument(chatId: number, buffer: Buffer, fileName: string, caption?: string): Promise<void> {
  const formData = new FormData();
  formData.append("chat_id", chatId.toString());
  formData.append("document", new Blob([new Uint8Array(buffer)], { type: "application/pdf" }), fileName);
  if (caption) formData.append("caption", caption);
  formData.append("parse_mode", "Markdown");

  await fetch(`${TELEGRAM_API}/sendDocument`, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(30000),
  });
}

async function tgGetFileUrl(fileId: string): Promise<string | null> {
  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  if (!res.ok) return null;
  const data = await res.json();
  const filePath = data.result?.file_path;
  if (!filePath) return null;
  return `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
}

async function tgDownloadBuffer(fileUrl: string): Promise<Buffer> {
  const res = await fetch(fileUrl, { signal: AbortSignal.timeout(20000) });
  return Buffer.from(await res.arrayBuffer());
}

// ─── POST: message processor ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  processTelegramUpdateAsync(body as any).catch((err) => {
    Sentry.captureException(err);
    console.error("[Telegram] Async processing error:", err);
  });

  return NextResponse.json({ ok: true });
}

// ─── Async processor ──────────────────────────────────────────────────────────

async function processTelegramUpdateAsync(update: any) {
  const message = update.message || update.callback_query?.message;
  const callbackQuery = update.callback_query;

  if (!message) return;

  const chatId = message.chat.id as number;
  const supabase = await createClient();

  // ── Callback query (inline keyboard button press) ─────────────────────────
  if (callbackQuery) {
    const data = callbackQuery.data as string;

    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    });

    if (data.startsWith("create_resume:")) {
      const extractionId = data.split(":")[1];
      await tgSendMessage(chatId, "⚙️ *Synthesis Protocol Initiated...*\n\nFetching your profile and tailoring for the role. This takes ~20 seconds.");

      try {
        // 1. Verify and Link Account
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("telegram_chat_id", String(chatId))
          .single();

        if (!profile) {
          await tgSendMessage(chatId, "⚠️ *Account Not Linked.*\n\nI need to know who you are first! Type /link to connect your Telegram to your VelseAI dashboard.");
          return;
        }

        // 2. Fetch Extraction & Latest Resume
        const [extractionRes, resumeRes] = await Promise.all([
          supabase.from("bot_extractions").select("*").eq("id", extractionId).single(),
          supabase.from("resumes").select("*").eq("user_id", profile.id).order("updated_at", { ascending: false }).limit(1).maybeSingle()
        ]);

        if (!extractionRes.data) throw new Error("JD metadata missing.");
        if (!resumeRes.data) {
          await tgSendMessage(chatId, "❌ *No Master Resume Found.*\n\nPlease upload or create a resume on velseai.com first so I have something to tailor!");
          return;
        }

        // 3. AI Tailoring synthesis
        const extraction = extractionRes.data;
        const masterContent = resumeRes.data.content as any;
        const jdText = extraction.full_jd_text || `${extraction.job_title} at ${extraction.company_name}. Skills: ${extraction.required_skills?.join(", ")}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a professional resume writer specializing in ATS optimization." },
            { role: "user", content: getTailorPrompt(JSON.stringify(masterContent), jdText, "en") }
          ],
          response_format: { type: "json_object" }
        });

        const tailoredContent = JSON.parse(completion.choices[0].message.content || "{}");

        // 4. Generate PDF Buffer
        const pdfBuffer = await resumeJsonToPdfBuffer(tailoredContent, {
          template: "modern",
          locale: "en"
        });

        // 5. Send PDF to Telegram
        await tgSendDocument(
          chatId,
          pdfBuffer,
          `VelseAI-${extraction.job_title.replace(/\s+/g, '-')}.pdf`,
          `🎯 Here is your tailored resume for *${extraction.job_title}* at *${extraction.company_name}*!\n\nOptimize: 90%+ ATS Match.`
        );

      } catch (err) {
        console.error("[Telegram] Tailoring error:", err);
        await tgSendMessage(chatId, "❌ Synthesis failed. Our GPT protocols are under load. Please try again in 30s.");
      }
    } else if (data === "link_account") {
      await tgSendMessage(
        chatId,
        `🔗 *Connect VelseAI Account*\n\nGo to: velseai.com/settings\nEnter this ID: \`${chatId}\``
      );
    }
    return;
  }

  // ── Photo: JD extraction ──────────────────────────────────────────────────
  if (message.photo) {
    await tgSendMessage(chatId, "📸 Got the Job Description photo! Analyzing performance... ⏳");

    try {
      const bestPhoto = message.photo.sort((a: any, b: any) => b.file_size - a.file_size)[0];
      const fileUrl = await tgGetFileUrl(bestPhoto.file_id);
      if (!fileUrl) throw new Error("Download failed");

      const imageBuffer = await tgDownloadBuffer(fileUrl);
      const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "user", content: [
            { type: "text", text: getJDVisionPrompt("en") },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } }
          ]}
        ],
        response_format: { type: "json_object" }
      });

      const raw = JSON.parse(completion.choices[0].message.content || "{}");
      const extraction = JDExtractionSchema.parse(raw);

      // Save to Database
      const { data: savedExt, error } = await supabase
        .from("bot_extractions")
        .insert({
          platform: "telegram",
          source_id: String(chatId),
          job_title: extraction.job_title,
          company_name: extraction.company_name,
          location: extraction.location,
          salary_range: extraction.salary_range,
          required_skills: extraction.required_skills,
          raw_extraction: extraction
        })
        .select()
        .single();

      if (error) throw error;

      const summary =
        `✅ *Analysis Complete*\n\n` +
        `🏢 *${extraction.company_name}*\n` +
        `💼 ${extraction.job_title}\n` +
        `🛠️ Skills: ${extraction.required_skills.slice(0, 5).join(", ")}\n\n` +
        `Ready to tailor your resume?`;

      await tgSendInlineKeyboard(chatId, summary, [
        [
          { text: "🎯 Tailor My Resume", callback_data: `create_resume:${savedExt.id}` },
          { text: "🔗 Link Account", callback_data: "link_account" }
        ]
      ]);
    } catch (err) {
      console.error("[Telegram] Scan error:", err);
      await tgSendMessage(chatId, "❌ Failed to scan JD. Try a clearer photo.");
    }
    return;
  }

  // ── Text commands ─────────────────────────────────────────────────────────
  if (message.text) {
    const text = message.text.toLowerCase();
    if (text === "/start" || text === "/help") {
      await tgSendMessage(chatId, "👋 *VelseAI Telegram HQ*\n\nSend me a photo of a Job Description and I'll tailor your resume in 20 seconds.\n\n/link - Connect your account\n/jobs - View tracker");
    } else if (text === "/link") {
      await tgSendMessage(chatId, `🔗 *Link ID:* \`${chatId}\`\n\nEnter this on velseai.com/settings.`);
    }
  }
}
