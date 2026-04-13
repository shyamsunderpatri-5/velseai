export const PLANS = {
  starter_monthly: {
    name: "Starter",
    price: 999,
    priceDisplay: "$9.99",
    yearlyPrice: 8388,
    yearlyPriceDisplay: "$83.88",
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
    price: 8388,
    priceDisplay: "$83.88",
    yearlyPrice: 8388,
    yearlyPriceDisplay: "$83.88",
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
    savings: "Save $35.88",
  },
  pro_monthly: {
    name: "Pro",
    price: 1499,
    priceDisplay: "$14.99",
    yearlyPrice: 12588,
    yearlyPriceDisplay: "$125.88",
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
    price: 12588,
    priceDisplay: "$125.88",
    yearlyPrice: 12588,
    yearlyPriceDisplay: "$125.88",
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
    savings: "Save $53.88",
  },
  lifetime: {
    name: "Lifetime",
    price: 4900,
    priceDisplay: "$49",
    yearlyPrice: 4900,
    yearlyPriceDisplay: "$49",
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
