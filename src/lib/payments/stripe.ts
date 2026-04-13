import Stripe from "stripe";

function getStripeInstance() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
}

export interface CreateCheckoutParams {
  planId: string;
  userId: string;
  email: string;
  name?: string;
  currency?: string;
}

export interface CreateCheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

const STRIPE_PRICES: Record<string, string> = {
  starter_monthly: "price_starter_monthly_id",
  starter_yearly: "price_starter_yearly_id",
  pro_monthly: "price_pro_monthly_id",
  pro_yearly: "price_pro_yearly_id",
  lifetime: "price_lifetime_id",
};

export async function createStripeCheckout({
  planId,
  userId,
  email,
  name,
  currency = "usd",
}: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  const stripe = getStripeInstance();
  const priceId = STRIPE_PRICES[planId];
  
  if (!priceId) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: planId.includes("lifetime") ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
    customer_email: email,
    metadata: {
      userId,
      planId,
    },
    ...(name && { customer_name: name }),
  });

  return {
    checkoutUrl: session.url!,
    sessionId: session.id,
  };
}

export async function verifyStripeSession(sessionId: string) {
  const stripe = getStripeInstance();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
}

export async function createStripeCustomer(email: string, name: string, userId: string) {
  const stripe = getStripeInstance();
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });
  return customer;
}

export async function cancelStripeSubscription(subscriptionId: string) {
  const stripe = getStripeInstance();
  return stripe.subscriptions.cancel(subscriptionId);
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const stripe = getStripeInstance();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}