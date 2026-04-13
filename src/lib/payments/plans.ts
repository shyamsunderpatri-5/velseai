export const PLANS = {
  starter_monthly: {
    name: "Starter",
    price: 19900,
    priceDisplay: "₹199",
    yearlyPrice: 149900,
    yearlyPriceDisplay: "₹1,499",
    features: [
      "5 resumes",
      "All 5 templates",
      "Unlimited ATS checks",
      "50 AI uses/day",
      "PDF + DOCX export",
      "Job tracker (50 jobs)",
      "Cover letter generator",
    ],
  },
  starter_yearly: {
    name: "Starter",
    price: 149900,
    priceDisplay: "₹1,499",
    yearlyPrice: 149900,
    yearlyPriceDisplay: "₹1,499",
    features: [
      "5 resumes",
      "All 5 templates",
      "Unlimited ATS checks",
      "50 AI uses/day",
      "PDF + DOCX export",
      "Job tracker (50 jobs)",
      "Cover letter generator",
    ],
    isYearly: true,
    savings: "Save ₹889",
  },
  pro_monthly: {
    name: "Pro",
    price: 49900,
    priceDisplay: "₹499",
    yearlyPrice: 399900,
    yearlyPriceDisplay: "₹3,999",
    features: [
      "Unlimited resumes",
      "All templates + future",
      "Unlimited ATS checks",
      "Unlimited AI uses",
      "PDF + DOCX export",
      "Unlimited job tracker",
      "Cover letter generator",
      "Public resume links",
      "LinkedIn import",
      "Priority support",
    ],
  },
  pro_yearly: {
    name: "Pro",
    price: 399900,
    priceDisplay: "₹3,999",
    yearlyPrice: 399900,
    yearlyPriceDisplay: "₹3,999",
    features: [
      "Unlimited resumes",
      "All templates + future",
      "Unlimited ATS checks",
      "Unlimited AI uses",
      "PDF + DOCX export",
      "Unlimited job tracker",
      "Cover letter generator",
      "Public resume links",
      "LinkedIn import",
      "Priority support",
    ],
    isYearly: true,
    savings: "Save ₹1,989",
  },
  lifetime: {
    name: "Lifetime",
    price: 299900,
    priceDisplay: "₹2,999",
    yearlyPrice: 299900,
    yearlyPriceDisplay: "₹2,999",
    features: [
      "Everything in Pro forever",
      "One-time payment",
      "Best value",
      "Early access features",
      "Priority support",
    ],
    isLifetime: true,
    badge: "Best Value",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: PlanId) {
  return PLANS[planId];
}

export function getPlanPrice(planId: PlanId, isYearly: boolean = false) {
  const plan = PLANS[planId];
  if (planId.includes("yearly") || isYearly) {
    return plan.yearlyPrice;
  }
  return plan.price;
}