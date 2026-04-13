export type Plan = "free" | "starter" | "pro" | "lifetime";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  plan: Plan;
  planExpiresAt: string | null;
  razorpayCustomerId: string | null;
  stripeCustomerId: string | null;
  atsChecksUsed: number;
  referralCode: string;
  referredBy: string | null;
  freeMonthsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  currency: string;
  paymentGateway: "razorpay" | "stripe";
  gatewayPaymentId: string | null;
  gatewayOrderId: string | null;
  status: "pending" | "active" | "cancelled" | "expired" | "refunded";
  startedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export type JobStatus = "saved" | "applied" | "phone_screen" | "interview" | "offer" | "rejected" | "withdrawn";

export interface JobApplication {
  id: string;
  userId: string;
  resumeId: string | null;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  jobDescription: string | null;
  status: JobStatus;
  appliedDate: string | null;
  followUpDate: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  jobType: string | null;
  notes: string | null;
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ATSScore {
  id: string;
  resumeId: string | null;
  userId: string | null;
  sessionId: string | null;
  jobDescription: string;
  companyName: string | null;
  jobTitle: string | null;
  overallScore: number;
  keywordScore: number;
  formatScore: number;
  experienceScore: number;
  skillsScore: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: {
    high_priority: string[];
    medium_priority: string[];
    low_priority: string[];
  };
  resumeText: string | null;
  createdAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId: string | null;
  jobApplicationId: string | null;
  title: string;
  content: string;
  createdAt: string;
}

export interface AIUsage {
  id: string;
  userId: string;
  feature: string;
  modelUsed: string | null;
  tokensUsed: number | null;
  createdAt: string;
}

export interface EmailQueueItem {
  id: string;
  toEmail: string;
  template: string;
  data: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  attempts: number;
  sentAt: string | null;
  error: string | null;
  createdAt: string;
}
