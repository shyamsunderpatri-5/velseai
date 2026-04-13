import Razorpay from "razorpay";
import { PLANS, type PlanId } from "./plans";

function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export interface CreateOrderParams {
  planId: PlanId;
  userId: string;
  email: string;
  currency?: string;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planId: PlanId;
}

export async function createRazorpayOrder({
  planId,
  userId,
  email,
  currency = "INR",
}: CreateOrderParams): Promise<CreateOrderResult> {
  const plan = PLANS[planId];
  const amount = plan.price;

  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `receipt_${userId}_${planId}_${Date.now()}`,
    notes: {
      userId,
      planId,
      email,
    },
    payment_capture: true,
  });

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    planId,
  };
}

export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  const crypto = await import("crypto");
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

export async function getRazorpayPaymentDetails(paymentId: string) {
  const razorpay = getRazorpayInstance();
  return razorpay.payments.fetch(paymentId);
}

export async function createRazorpayCustomer(userId: string, email: string, name: string) {
  const razorpay = getRazorpayInstance();
  const customer = await razorpay.customers.create({
    email,
    name,
    notes: {
      userId,
    },
  });
  return customer;
}