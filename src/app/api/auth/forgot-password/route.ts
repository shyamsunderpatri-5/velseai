import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email/sender";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Send directly via Gmail (more reliable)
    const name = email.split('@')[0];
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`;
    const emailHtml = getPasswordResetEmailHtml(name, resetUrl);
    
    const emailResult = await sendEmail({
      to: email,
      subject: "Reset your VELSEAI password",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Email send error:", emailResult.error);
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Password reset link sent to your email" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}