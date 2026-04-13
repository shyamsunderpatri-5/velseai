import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payments/razorpay";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/payments/plans";

const createOrderSchema = z.object({
  planId: z.enum(["starter_monthly", "starter_yearly", "pro_monthly", "pro_yearly", "lifetime"]),
  currency: z.enum(["INR", "USD"]).default("INR"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.plan === "pro" || profile?.plan === "lifetime") {
      return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid plan", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { planId, currency } = parsed.data;
    const plan = PLANS[planId];

    const order = await createRazorpayOrder({
      planId,
      userId: user.id,
      email: user.email || "",
      currency,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      plan: plan,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    const isValid = await verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const plan = planId.includes("lifetime") ? "lifetime" 
      : planId.includes("pro") ? "pro" 
      : "starter";

    const expiresAt = planId.includes("yearly")
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan,
        plan_expires_at: planId.includes("lifetime") ? null : expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan,
      amount: PLANS[planId as PlanId].price,
      currency: "INR",
      payment_gateway: "razorpay",
      gateway_payment_id: razorpayPaymentId,
      gateway_order_id: razorpayOrderId,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: planId.includes("lifetime") ? null : expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated",
      plan,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}