import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, planId } = session.metadata || {};

        if (userId && planId) {
          const plan = planId.includes("lifetime") ? "lifetime"
            : planId.includes("pro") ? "pro"
            : "starter";

          const expiresAt = planId.includes("yearly")
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await supabase
            .from("profiles")
            .update({
              plan,
              plan_expires_at: planId.includes("lifetime") ? null : expiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          await supabase.from("subscriptions").insert({
            user_id: userId,
            plan,
            amount: session.amount_total || 0,
            currency: session.currency?.toUpperCase() || "USD",
            payment_gateway: "stripe",
            gateway_payment_id: session.payment_intent as string,
            gateway_order_id: session.id,
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: planId.includes("lifetime") ? null : expiresAt,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              plan: "free",
              plan_expires_at: null,
            })
            .eq("id", profile.id);

          await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("user_id", profile.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("user_id", profile.id);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}