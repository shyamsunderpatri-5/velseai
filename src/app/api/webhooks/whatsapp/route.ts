import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { mediaIdToBase64, uploadMediaToSupabase } from "@/lib/whatsapp/media";
import {
  sendText,
  sendInteractiveButtons,
  sendDocument,
  sendReaction,
  markAsRead,
} from "@/lib/whatsapp/client";
import { getJDVisionPrompt } from "@/lib/ai/prompts";
import { JDExtractionSchema } from "@/lib/ai/structured-outputs";
import OpenAI from "openai";
import * as Sentry from "@sentry/nextjs";

/**
 * VelseAI — WhatsApp Webhook (Full Brain)
 *
 * GET:  Meta webhook verification (hub.challenge handshake)
 * POST: Inbound message processor
 *
 * Architecture (production-grade):
 * ┌──────────────────────────────────────────┐
 * │  POST /api/webhooks/whatsapp             │
 * │  1. Return 200 IMMEDIATELY               │ ← Required by Meta (<5s or retry)
 * │  2. Parse + deduplicate message_id       │ ← Idempotency
 * │  3. Route to appropriate handler:        │
 * │     - is_image → JD Vision pipeline     │
 * │     - button_reply → action dispatcher  │
 * │     - text → command router (help, etc) │
 * │  4. All handlers are async + fire-and-  │
 * │     forget (no await on send)           │
 * └──────────────────────────────────────────┘
 *
 * JD Photo pipeline:
 * photo → GPT-4o vision OCR → structured JD data
 *       → store in jd_extractions + messaging_sessions context
 *       → send interactive buttons: [Create ATS Resume] [View Analysis]
 *
 * On "Create ATS Resume" button reply:
 * → load user's latest resume from DB
 * → call fix-resume AI (inject JD keywords)
 * → generate PDF (Puppeteer or pdf-lib)
 * → send PDF document back in WhatsApp
 * → create job_application entry in tracker
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use service role client — webhooks are unauthenticated HTTP calls
async function getDb() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── GET: Meta Webhook Verification ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "velseai_whatsapp_verify";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verified ✓");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ─── POST: Inbound Message Processor ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  // CRITICAL: Return 200 IMMEDIATELY — Meta will retry if we take >5s
  const body = await request.json();

  // Fire-and-forget: process async but don't block the response
  processWebhookAsync(body).catch((err) => {
    Sentry.captureException(err);
    console.error("[WhatsApp] Async processing error:", err);
  });

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ─── Async Message Processor ──────────────────────────────────────────────────

async function processWebhookAsync(body: Record<string, unknown>) {
  const db = await getDb();

  try {
    // Extract message from Meta's nested payload structure
    const entry = (body.entry as Record<string, unknown>[])?.[0];
    const changes = (entry?.changes as Record<string, unknown>[])?.[0];
    const value = changes?.value as Record<string, unknown>;
    const messages = value?.messages as Record<string, unknown>[];
    const message = messages?.[0];

    if (!message) {
      // Could be a status update (delivered, read) — ignore
      return;
    }

    const messageId = message.id as string;
    const fromPhone = message.from as string;
    const messageType = message.type as string;

    // ── Idempotency: skip if we've processed this message_id before ───────────
    const { data: session } = await db
      .from("messaging_sessions")
      .select("*")
      .eq("platform", "whatsapp")
      .eq("platform_id", fromPhone)
      .single();

    if (session?.last_message_id === messageId) {
      console.log(`[WhatsApp] Dedup: already processed message ${messageId}`);
      return;
    }

    // ── Find or create session ────────────────────────────────────────────────
    const { data: currentSession } = await db
      .from("messaging_sessions")
      .upsert(
        {
          platform: "whatsapp",
          platform_id: fromPhone,
          last_message_id: messageId,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "platform,platform_id" }
      )
      .select()
      .single();

    // Find linked VelseAI user (by phone stored in whatsapp_sessions table)
    const { data: waSession } = await db
      .from("whatsapp_sessions")
      .select("user_id, verified")
      .eq("phone_number", fromPhone)
      .eq("is_active", true)
      .single();

    const userId = waSession?.user_id || null;
    const isVerified = waSession?.verified || false;

    // ── Acknowledge with read receipt ─────────────────────────────────────────
    await markAsRead(messageId).catch(() => {});

    // ── Route by message type ─────────────────────────────────────────────────
    if (messageType === "image") {
      await handleImageMessage(fromPhone, message, userId, isVerified, currentSession, db);
    } else if (messageType === "interactive") {
      await handleButtonReply(fromPhone, message, userId, currentSession, db);
    } else if (messageType === "text") {
      await handleTextMessage(fromPhone, message, userId, isVerified);
    } else if (messageType === "document") {
      await handleDocumentMessage(fromPhone, message);
    } else {
      // Unknown type — send help
      await sendText({
        to: fromPhone,
        body: "👋 I didn't understand that. Send me a *photo of a job description* or type *help* for commands.",
      });
    }
  } catch (err) {
    console.error("[WhatsApp] Processing error:", err);
    Sentry.captureException(err);
  }
}

// ─── Handler: Image (JD Photo) ────────────────────────────────────────────────

async function handleImageMessage(
  fromPhone: string,
  message: Record<string, unknown>,
  userId: string | null,
  isVerified: boolean,
  session: Record<string, unknown> | null,
  db: Awaited<ReturnType<typeof getDb>>
) {
  const image = message.image as { id: string; mime_type: string };
  const mediaId = image?.id;

  if (!mediaId) {
    await sendText({ to: fromPhone, body: "❌ Could not process the image. Please try again." });
    return;
  }

  // React with "processing" emoji
  await sendReaction(fromPhone, message.id as string, "⏳").catch(() => {});

  await sendText({
    to: fromPhone,
    body: "📸 Got your job description photo! Analyzing with AI...\n\n_This takes 10–15 seconds._",
  });

  try {
    // 1. Fetch media buffer
    const { dataUrl, mimeType, byteSize } = await mediaIdToBase64(mediaId);

    if (byteSize > 10 * 1024 * 1024) {
      // >10MB image — unlikely but handle gracefully
      await sendText({
        to: fromPhone,
        body: "❌ Image is too large (max 10MB). Try a cropped screenshot.",
      });
      return;
    }

    // 2. GPT-4o Vision: Extract JD data
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: getJDVisionPrompt("en") },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let extraction;

    try {
      const parsed = JSON.parse(rawContent);
      extraction = JDExtractionSchema.parse(parsed);
    } catch (parseErr) {
      console.error("[WhatsApp] JD extraction parse error:", parseErr, rawContent);
      await sendText({
        to: fromPhone,
        body: "❌ I couldn't extract the job description clearly. Try a clearer photo or paste the JD as text.",
      });
      return;
    }

    // 3. Save to jd_extractions table
    const { data: savedExtraction } = await db.from("jd_extractions").insert({
      user_id: userId,
      extracted_jd: extraction.raw_text,
      company_name: extraction.company_name,
      job_title: extraction.job_title,
      required_skills: extraction.required_skills,
      model_used: "gpt-4o",
      confidence_score: extraction.confidence,
    }).select("id").single();

    // 4. Update session context with JD data
    await db
      .from("messaging_sessions")
      .update({
        state: "awaiting_resume_choice",
        context: {
          jd_extraction_id: savedExtraction?.id,
          company: extraction.company_name,
          role: extraction.job_title,
          skills: extraction.required_skills.slice(0, 8),
          jd_text: extraction.raw_text.slice(0, 2000),
          confidence: extraction.confidence,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("platform", "whatsapp")
      .eq("platform_id", fromPhone);

    // 5. Build result summary message
    const skillsList = extraction.required_skills.slice(0, 6).join(", ");
    const salaryStr = extraction.salary_range ? `\n💰 Salary: ${extraction.salary_range}` : "";
    const locationStr = extraction.location ? `\n📍 Location: ${extraction.location}` : "";

    const summaryText = [
      `✅ *Job Description Analyzed!*`,
      ``,
      `🏢 *${extraction.company_name}*`,
      `💼 ${extraction.job_title}`,
      locationStr,
      salaryStr,
      ``,
      `🛠️ Key skills: ${skillsList}`,
      ``,
      extraction.confidence < 0.7
        ? `⚠️ _Image quality was low — results may be incomplete._\n`
        : "",
      `What would you like to do?`,
    ]
      .filter(Boolean)
      .join("\n");

    // 6. Send interactive buttons
    await sendInteractiveButtons({
      to: fromPhone,
      bodyText: summaryText,
      footerText: "Powered by VelseAI 🚀",
      buttons: [
        { id: "create_ats_resume", title: "🎯 Create ATS Resume" },
        { id: "view_analysis", title: "📊 View Full Analysis" },
        ...(!isVerified ? [{ id: "link_account", title: "🔗 Link My Account" }] : []),
      ].slice(0, 3),
    });

  } catch (err) {
    console.error("[WhatsApp] Image processing error:", err);
    Sentry.captureException(err);
    await sendText({
      to: fromPhone,
      body: "❌ Something went wrong processing your image. Please try again.",
    });
  }
}

// ─── Handler: Button Reply ────────────────────────────────────────────────────

async function handleButtonReply(
  fromPhone: string,
  message: Record<string, unknown>,
  userId: string | null,
  session: Record<string, unknown> | null,
  db: Awaited<ReturnType<typeof getDb>>
) {
  const interactive = message.interactive as Record<string, unknown>;
  const buttonReply = interactive?.button_reply as Record<string, unknown>;
  const buttonId = buttonReply?.id as string;

  const context = (session?.context as Record<string, unknown>) || {};

  switch (buttonId) {
    case "create_ats_resume": {
      if (!userId) {
        await sendText({
          to: fromPhone,
          body: "🔗 To generate a tailored resume, you need to link your VelseAI account first.\n\nVisit: *velseai.com/settings/whatsapp* to connect your phone number.",
        });
        return;
      }

      await sendText({
        to: fromPhone,
        body: "⚙️ Generating your ATS-optimized resume... this takes ~20 seconds.",
      });

      try {
        // 1. Get user's latest resume
        const { data: resume } = await db
          .from("resumes")
          .select("*, content")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (!resume) {
          await sendText({
            to: fromPhone,
            body: "❌ No resume found in your VelseAI account. Create one at *velseai.com/resume/new* first.",
          });
          return;
        }

        // 2. Call fix-resume API internally
        const fixRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/fix-resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId: resume.id,
            jobDescription: context.jd_text,
            userId,
            locale: "en",
          }),
        });

        if (!fixRes.ok) throw new Error("Fix resume API failed");
        const { pdfBuffer, jobTitle } = await fixRes.json();

        // 3. Send PDF document back in WhatsApp
        const pdfBuf = Buffer.from(pdfBuffer, "base64");
        await sendDocument({
          to: fromPhone,
          documentBuffer: pdfBuf,
          fileName: `velse_resume_${Date.now()}.pdf`,
          caption: `🎯 Your ATS-optimized resume for *${context.role || jobTitle}* at *${context.company}*.\n\nGood luck! 🚀`,
        });

        // 4. Add to job tracker
        await db.from("job_applications").insert({
          user_id: userId,
          resume_id: resume.id,
          company_name: context.company || "Unknown",
          job_title: context.role || "Position",
          job_description: context.jd_text,
          status: "applied",
          source: "whatsapp",
          applied_date: new Date().toISOString().split("T")[0],
        });

        await sendText({
          to: fromPhone,
          body: "✅ Added to your job tracker too! Visit *velseai.com/jobs* to track progress.",
        });

      } catch (err) {
        console.error("[WhatsApp] Create resume error:", err);
        await sendText({
          to: fromPhone,
          body: "❌ Failed to generate resume. Please try from the app at velseai.com",
        });
      }
      break;
    }

    case "view_analysis": {
      const jdText = context.jd_text as string || "";
      const skills = (context.skills as string[]) || [];
      const analysisText = [
        `📊 *Full Analysis*`,
        ``,
        `*Company:* ${context.company}`,
        `*Role:* ${context.role}`,
        ``,
        `*Required Skills:*`,
        skills.map((s) => `• ${s}`).join("\n"),
        ``,
        `*Description Preview:*`,
        jdText.slice(0, 400) + (jdText.length > 400 ? "..." : ""),
      ]
        .join("\n");

      await sendText({ to: fromPhone, body: analysisText });
      await sendInteractiveButtons({
        to: fromPhone,
        bodyText: "Want to create a tailored resume for this job?",
        buttons: [
          { id: "create_ats_resume", title: "🎯 Create ATS Resume" },
        ],
      });
      break;
    }

    case "link_account": {
      await sendText({
        to: fromPhone,
        body: `🔗 *Link your VelseAI account:*\n\n1. Go to: *velseai.com/settings/whatsapp*\n2. Enter your phone number: *${fromPhone}*\n3. Tap "Send Verification Code"\n\nYou'll get a code here in WhatsApp to confirm! 📱`,
      });
      break;
    }

    default: {
      await sendText({
        to: fromPhone,
        body: "❓ Unrecognized action. Type *help* to see what I can do.",
      });
    }
  }
}

// ─── Handler: Text Commands ───────────────────────────────────────────────────

async function handleTextMessage(
  fromPhone: string,
  message: Record<string, unknown>,
  userId: string | null,
  isVerified: boolean
) {
  const text = ((message.text as Record<string, unknown>)?.body as string || "").toLowerCase().trim();

  if (text === "help" || text === "hi" || text === "hello" || text === "/start") {
    await sendText({
      to: fromPhone,
      body: [
        `👋 *Welcome to VelseAI!*`,
        `Your AI career co-pilot on WhatsApp.`,
        ``,
        `Here's what I can do:`,
        ``,
        `📸 *Send a photo* of any job posting → I'll extract it and create a tailored resume`,
        `📊 *resume* → Check your resume score`,
        `💼 *jobs* → See your job applications`,
        `🔗 *link* → Connect your VelseAI account`,
        `❓ *help* → Show this menu`,
        ``,
        `Not a user yet? Sign up free at *velseai.com* 🚀`,
      ].join("\n"),
    });
    return;
  }

  if (text === "link" || text === "connect" || text === "signup") {
    await sendText({
      to: fromPhone,
      body: `🔗 Connect your account at: *velseai.com/settings/whatsapp*\n\nUse phone: *${fromPhone}*`,
    });
    return;
  }

  if (text === "jobs" && userId) {
    await sendText({
      to: fromPhone,
      body: `💼 View your job tracker at: *velseai.com/jobs*`,
    });
    return;
  }

  if (text === "resume" && userId) {
    await sendText({
      to: fromPhone,
      body: `📄 Manage your resumes at: *velseai.com/resume*\n\nOr send me a *photo of a job description* and I'll tailor it for you! 📸`,
    });
    return;
  }

  // Default: unrecognized
  await sendText({
    to: fromPhone,
    body: `🤔 I'm best with *photos of job descriptions*!\n\nSend me a JD screenshot and I'll extract it + create a tailored resume.\n\nType *help* for all commands.`,
  });
}

// ─── Handler: Document (user sent a PDF resume) ───────────────────────────────

async function handleDocumentMessage(
  fromPhone: string,
  message: Record<string, unknown>
) {
  const doc = message.document as Record<string, unknown>;
  const mimeType = doc?.mime_type as string || "";

  if (mimeType === "application/pdf") {
    await sendText({
      to: fromPhone,
      body: [
        `📄 Got your CV/resume!`,
        ``,
        `For full AI analysis, upload it at: *velseai.com/ats-checker*`,
        ``,
        `Or send me a *photo of a job description* and I'll score your resume against it! 🎯`,
      ].join("\n"),
    });
  } else {
    await sendText({
      to: fromPhone,
      body: `📁 I can read job description *photos/screenshots* best.\n\nType *help* to see all commands.`,
    });
  }
}
