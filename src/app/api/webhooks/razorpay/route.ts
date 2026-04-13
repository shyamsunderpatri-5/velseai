import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const notes = payment.notes || {};
        
        if (notes.userId && notes.planId) {
          const plan = notes.planId.includes("lifetime") ? "lifetime"
            : notes.planId.includes("pro") ? "pro"
            : "starter";

          const expiresAt = notes.planId.includes("yearly")
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await supabase
            .from("profiles")
            .update({
              plan,
              plan_expires_at: notes.planId.includes("lifetime") ? null : expiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", notes.userId);

          await supabase.from("subscriptions").insert({
            user_id: notes.userId,
            plan,
            amount: payment.amount,
            currency: payment.currency || "INR",
            payment_gateway: "razorpay",
            gateway_payment_id: payment.id,
            gateway_order_id: payment.order_id,
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: notes.planId.includes("lifetime") ? null : expiresAt,
          });

          // Check if user was referred and reward referrer
          const { data: referredUser } = await supabase
            .from("profiles")
            .select("referred_by")
            .eq("id", notes.userId)
            .single();

          if (referredUser?.referred_by) {
            // Give referrer 1 free month
            const { data: referrer } = await supabase
              .from("profiles")
              .select("free_months_earned")
              .eq("id", referredUser.referred_by)
              .single();

            if (referrer) {
              await supabase
                .from("profiles")
                .update({
                  free_months_earned: (referrer.free_months_earned || 0) + 1,
                })
                .eq("id", referredUser.referred_by);
            }
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const notes = payment.notes || {};
        
        if (notes.userId) {
          await supabase.from("subscriptions").insert({
            user_id: notes.userId,
            plan: notes.planId || "failed",
            amount: payment.amount,
            currency: payment.currency || "INR",
            payment_gateway: "razorpay",
            gateway_payment_id: payment.id,
            gateway_order_id: payment.order_id,
            status: "cancelled",
            started_at: null,
            expires_at: null,
          });
        }
        break;
      }

      default:
        console.log("Unhandled event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}