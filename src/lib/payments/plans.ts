export const PLANS = {
  starter_monthly: {
    name: "Starter",
    price: 1900,
    priceDisplay: "$19",
    yearlyPrice: 19200,
    yearlyPriceDisplay: "$192",
    features: [
      "5 resumes",
      "All professional templates",
      "Unlimited ATS checks",
      "3 AI technical rounds / month",
      "PDF + DOCX export",
      "Job tracker (50 jobs)",
      "Cover letter generator",
    ],
  },
  starter_yearly: {
    name: "Starter",
    price: 13200,
    priceDisplay: "$132",
    yearlyPrice: 13200,
    yearlyPriceDisplay: "$132",
    features: [
      "5 resumes",
      "All professional templates",
      "Unlimited ATS checks",
      "50 AI technical rounds / year",
      "PDF + DOCX export",
      "Job tracker (50 jobs)",
      "Cover letter generator",
    ],
    isYearly: true,
    savings: "Save $60/year",
  },
  pro_monthly: {
    name: "Pro",
    price: 3900,
    priceDisplay: "$39",
    yearlyPrice: 34800,
    yearlyPriceDisplay: "$348",
    features: [
      "Unlimited resumes",
      "All templates + future",
      "Unlimited ATS checks",
      "Unlimited AI Technical Rounds",
      "Public Portfolio (velseai.com/u/)",
      "Unlimited job tracker",
      "LinkedIn auto-import",
      "Priority AI processing",
    ],
  },
  pro_yearly: {
    name: "Pro",
    price: 22800,
    priceDisplay: "$228",
    yearlyPrice: 22800,
    yearlyPriceDisplay: "$228",
    features: [
      "Everything in Pro Monthly",
      "Premium portfolio themes",
      "Direct recruiter contact",
      "Advanced interview feedback",
      "Dedicated career coach AI",
    ],
    isYearly: true,
    savings: "Save $240/year",
  },
  lifetime: {
    name: "Lifetime",
    price: 14900,
    priceDisplay: "$149",
    yearlyPrice: 14900,
    yearlyPriceDisplay: "$149",
    features: [
      "Everything in Pro forever",
      "One-time payment",
      "Founding member badge",
      "Early access to Phase 4",
      "White-glove support",
    ],
    isLifetime: true,
    badge: "Limited Offer",
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
