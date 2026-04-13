import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { JDExtractionSchema } from "@/lib/ai/structured-outputs";
import { getJDVisionPrompt } from "@/lib/ai/prompts";
import OpenAI from "openai";
import { mediaIdToBase64 } from "@/lib/whatsapp/media";

/**
 * VelseAI — Telegram Bot Webhook
 *
 * GET:  Not used (Telegram uses setWebhook API, not hub.challenge)
 * POST: Inbound message processor
 *
 * Setup:
 *   curl -F "url=https://velseai.com/api/webhooks/telegram" \
 *        https://api.telegram.org/bot{TOKEN}/setWebhook
 *
 * Supported message types:
 *   - photo → JD vision extraction → send structured reply + apply keyboard
 *   - text → command router (start, help, jobs, resume, link)
 *   - document (PDF) → acknowledge
 *
 * Architecture: same pattern as WhatsApp — return 200 immediately, process async.
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

// ─── GET: not used ────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({ ok: true, bot: "VelseAI Telegram Bot" });
}

// ─── POST: message processor ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Return 200 immediately — Telegram retries if we don't respond quickly
  processTelegramUpdateAsync(body as any).catch((err) => {
    Sentry.captureException(err);
    console.error("[Telegram] Async processing error:", err);
  });

  return NextResponse.json({ ok: true });
}

// ─── Async processor ──────────────────────────────────────────────────────────

async function processTelegramUpdateAsync(update: any) {
  const message = (update.message || update.callback_query?.message);
  const callbackQuery = update.callback_query;

  if (!message) return;

  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const messageType = message.photo
    ? "photo"
    : message.document
    ? "document"
    : message.text
    ? "text"
    : "unknown";

  // ── Callback query (inline keyboard button press) ─────────────────────────
  if (callbackQuery) {
    const data = callbackQuery.data as string;
    const callbackChatId = (
      (callbackQuery.message as Record<string, unknown>)?.chat as Record<string, unknown>
    )?.id as number;

    // Acknowledge callback
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    });

    if (data === "create_resume") {
      await tgSendMessage(callbackChatId, "⚙️ Generating your ATS-optimized resume...\n\n_This takes ~20 seconds._");
      // TODO: same flow as WhatsApp create_ats_resume button
    } else if (data === "link_account") {
      await tgSendMessage(
        callbackChatId,
        "🔗 *Link your VelseAI account:*\n\n1. Go to: velseai.com/settings/whatsapp\n2. Enter your Telegram user ID: `" +
          String(callbackChatId) +
          "`\n3. Tap \"Connect Telegram\"\n\nYou're ready to go! 🚀"
      );
    }
    return;
  }

  // ── Photo: JD extraction ──────────────────────────────────────────────────
  if (messageType === "photo") {
    await tgSendMessage(chatId, "📸 Got your job description photo! Analyzing with AI... ⏳\n\n_Takes 10–15 seconds._");

    try {
      const photos = message.photo as Record<string, unknown>[];
      const bestPhoto = photos.sort((a, b) => (b.file_size as number) - (a.file_size as number))[0];
      const fileId = bestPhoto.file_id as string;

      const fileUrl = await tgGetFileUrl(fileId);
      if (!fileUrl) {
        await tgSendMessage(chatId, "❌ Could not download the image. Please try again.");
        return;
      }

      const imageBuffer = await tgDownloadBuffer(fileUrl);
      const base64 = imageBuffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // GPT-4o vision extraction
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: getJDVisionPrompt("en") },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const rawContent = completion.choices[0]?.message?.content || "{}";
      let extraction;
      try {
        extraction = JDExtractionSchema.parse(JSON.parse(rawContent));
      } catch {
        await tgSendMessage(chatId, "❌ Couldn't read the job description clearly. Try a higher-quality photo.");
        return;
      }

      const skills = extraction.required_skills.slice(0, 6).join(", ");
      const salaryLine = extraction.salary_range ? `\n💰 *Salary:* ${extraction.salary_range}` : "";
      const locationLine = extraction.location ? `\n📍 *Location:* ${extraction.location}` : "";

      const summary =
        `✅ *Job Description Analyzed!*\n\n` +
        `🏢 *${extraction.company_name}*\n` +
        `💼 ${extraction.job_title}${locationLine}${salaryLine}\n\n` +
        `🛠️ *Key Skills:* ${skills}\n\n` +
        `What would you like to do?`;

      await tgSendInlineKeyboard(chatId, summary, [
        [
          { text: "🎯 Create ATS Resume", callback_data: "create_resume" },
          { text: "🔗 Link My Account", callback_data: "link_account" },
        ],
      ]);
    } catch (err) {
      console.error("[Telegram] Photo processing error:", err);
      await tgSendMessage(chatId, "❌ Something went wrong. Please try again.");
    }
    return;
  }

  // ── Text commands ─────────────────────────────────────────────────────────
  if (messageType === "text") {
    const text = ((message.text as string) || "").toLowerCase().trim();

    if (text === "/start" || text === "/help" || text === "help") {
      await tgSendInlineKeyboard(
        chatId,
        [
          "👋 *Welcome to VelseAI Bot!* Your AI career co-pilot on Telegram.\n",
          "Here's what I can do:\n",
          "📸 *Send a photo* of any job posting → I'll extract and tailor your resume",
          "💼 /jobs → See your job tracker",
          "📄 /resume → Manage resumes",
          "🔗 /link → Connect your VelseAI account",
          "❓ /help → This menu\n",
          "Not a user yet? Sign up free at *velseai.com* 🚀",
        ].join("\n"),
        [[{ text: "🌐 Open VelseAI", callback_data: "open_app" }]]
      );
    } else if (text === "/jobs") {
      await tgSendMessage(chatId, "💼 View your job tracker at:\nhttps://velseai.com/jobs");
    } else if (text === "/resume") {
      await tgSendMessage(chatId, "📄 Manage your resumes at:\nhttps://velseai.com/resume\n\nOr send me a job description photo to tailor it automatically! 📸");
    } else if (text === "/link") {
      await tgSendMessage(
        chatId,
        `🔗 *Link your VelseAI account:*\n\n1. Go to: velseai.com/settings\n2. Enter your Telegram Chat ID: \`${chatId}\`\n3. Save settings`
      );
    } else {
      await tgSendMessage(chatId, "🤔 I'm best with *job description photos*!\n\nSend me a screenshot of a job posting and I'll create a tailored resume.\n\nType /help for all commands.");
    }
  }
}
