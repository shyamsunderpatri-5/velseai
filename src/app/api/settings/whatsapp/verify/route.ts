import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { sendText } from "@/lib/whatsapp/client";

/**
 * WhatsApp phone verification flow
 *
 * POST /api/settings/whatsapp/verify
 *   - step: "send_code" → sends a 6-digit OTP via WhatsApp
 *   - step: "confirm_code" → verifies OTP, links phone to user account
 *
 * DELETE /api/settings/whatsapp/verify
 *   - Disconnects WhatsApp from the user's account
 */

const sendCodeSchema = z.object({
  step: z.literal("send_code"),
  phone: z.string().min(10, "Invalid phone number").max(15),   // E.164 without '+'
});

const confirmCodeSchema = z.object({
  step: z.literal("confirm_code"),
  phone: z.string(),
  code: z.string().length(6, "Code must be 6 digits"),
});

const bodySchema = z.discriminatedUnion("step", [sendCodeSchema, confirmCodeSchema]);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Normalize phone: remove all non-digits, ensure no leading +
    const rawPhone = parsed.data.phone.replace(/\D/g, "");

    // ── STEP 1: Send OTP via WhatsApp ─────────────────────────────────────────
    if (parsed.data.step === "send_code") {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      // Store in whatsapp_verifications (temp table)
      const { error: insertError } = await supabase
        .from("whatsapp_verifications")
        .upsert(
          {
            user_id: user.id,
            phone_number: rawPhone,
            otp_code: otp,
            expires_at: expiresAt,
            verified: false,
          },
          { onConflict: "user_id" }
        );

      if (insertError) {
        throw new Error(`DB error: ${insertError.message}`);
      }

      // Send OTP via WhatsApp
      try {
        await sendText({
          to: rawPhone,
          body: [
            `🔐 *VelseAI Verification Code*`,
            ``,
            `Your code: *${otp}*`,
            ``,
            `This code expires in 10 minutes.`,
            `Do not share this code with anyone.`,
          ].join("\n"),
        });
      } catch (waError) {
        // If WhatsApp send fails, still return success if we're in dev (mock mode)
        if (process.env.NODE_ENV === "production") {
          throw waError;
        }
        console.warn("[WhatsApp verify] WA send failed (dev mode):", waError);
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your WhatsApp!",
        // In dev mode, return OTP for easy testing
        ...(process.env.NODE_ENV !== "production" ? { dev_otp: otp } : {}),
      });
    }

    // ── STEP 2: Confirm OTP ───────────────────────────────────────────────────
    if (parsed.data.step === "confirm_code") {
      const { data: verification } = await supabase
        .from("whatsapp_verifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("phone_number", rawPhone)
        .eq("verified", false)
        .single();

      if (!verification) {
        return NextResponse.json(
          { error: "No pending verification found. Please request a new code." },
          { status: 404 }
        );
      }

      if (new Date(verification.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Code expired. Please request a new code." },
          { status: 410 }
        );
      }

      if (verification.otp_code !== parsed.data.code) {
        return NextResponse.json(
          { error: "Invalid verification code." },
          { status: 400 }
        );
      }

      // Mark as verified + create/update whatsapp_sessions entry
      await supabase
        .from("whatsapp_verifications")
        .update({ verified: true })
        .eq("user_id", user.id);

      await supabase
        .from("whatsapp_sessions")
        .upsert(
          {
            user_id: user.id,
            phone_number: rawPhone,
            verified: true,
            is_active: true,
            connected_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      // Send welcome message
      try {
        await sendText({
          to: rawPhone,
          body: [
            `✅ *WhatsApp connected to VelseAI!*`,
            ``,
            `You're all set. Here's what you can do:`,
            ``,
            `📸 *Send a job description photo* → I'll extract it and create a tailored resume`,
            `💼 Type *jobs* → See your application tracker`,
            `📄 Type *resume* → Manage your resumes`,
            `❓ Type *help* → See all commands`,
            ``,
            `Good luck with your job search! 🚀`,
          ].join("\n"),
        });
      } catch {
        // Non-fatal
      }

      return NextResponse.json({
        success: true,
        message: "WhatsApp connected successfully!",
        phone: rawPhone,
      });
    }

  } catch (err) {
    Sentry.captureException(err);
    console.error("[/api/settings/whatsapp/verify] Error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await supabase
      .from("whatsapp_sessions")
      .update({ is_active: false, disconnected_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, message: "WhatsApp disconnected" });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Disconnect failed" }, { status: 500 });
  }
}
