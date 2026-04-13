import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Webhook verification (required by Meta)
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "velseai_whatsapp_verify";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    // TODO Phase 3: WhatsApp Business API webhook
    // Inbound flow:
    // 1. User sends photo/screenshot of job description
    // 2. GPT-4o vision extracts: company, role, requirements, skills
    // 3. Two options sent back: "Create Tailored Resume" | "View Full Analysis"
    // 4. On "Create Tailored Resume": generate resume → send PDF back in chat

    const body = await request.json();
    
    // Log incoming webhook for now
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // Store the message in database
    const supabase = await createClient();
    
    // Extract message data from WhatsApp payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      // Get or create user session based on phone number
      const phone = message.from;
      
      // Find user by phone (you'd need to store phone in profiles)
      // For now, just log
      console.log("Received WhatsApp message from:", phone);

      // TODO: Store message in whatsapp_messages table
      // TODO: If image: extract JD using GPT-4o vision
      // TODO: Generate tailored resume and send back
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
