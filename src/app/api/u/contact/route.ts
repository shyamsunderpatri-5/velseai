import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sender";

const contactSchema = z.object({
  username: z.string(),
  senderName: z.string(),
  senderEmail: z.string().email(),
  message: z.string().min(10),
});

/**
 * Recruiter Contact Bridge
 * POST /api/u/contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { username, senderName, senderEmail, message } = parsed.data;

    const supabase = await createClient();

    // Fetch user's actual email
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("username", username)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Send the email
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>New Recruiter Lead from VelseAI</h2>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Target:</strong> Your Public Portfolio (${username})</p>
        <hr />
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          This message was sent via your VelseAI public bio-page. You can reply directly to the sender's email above.
        </p>
      </div>
    `;

    await sendEmail({
      to: profile.email,
      subject: `[VelseAI] New Message from ${senderName}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Recruiter contact error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
