import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createStripeCheckout } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  planId: z.enum(["starter_monthly", "starter_yearly", "pro_monthly", "pro_yearly", "lifetime"]),
  currency: z.enum(["USD", "INR"]).default("USD"),
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
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid plan", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { planId, currency } = parsed.data;

    const checkout = await createStripeCheckout({
      planId,
      userId: user.id,
      email: user.email || "",
      name: profile?.full_name || undefined,
      currency: currency.toLowerCase(),
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}