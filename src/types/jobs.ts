/**
 * VelseAI — Job-related TypeScript types
 * Central type definitions for job tracker, external job discovery,
 * and related UI state.
 */

export type JobStatus =
  | "saved"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type JobSource = "manual" | "theirstack" | "whatsapp" | "telegram";
export type JobType = "full_time" | "part_time" | "contract" | "remote" | "hybrid";

// ─── Internal Job Application (from job_applications table) ───────────────────

export interface JobApplication {
  id: string;
  user_id: string;
  resume_id: string | null;
  cover_letter_id: string | null;
  company_name: string;
  job_title: string;
  job_url: string | null;
  job_description: string | null;
  status: JobStatus;
  applied_date: string | null;
  follow_up_date: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  job_type: string | null;
  notes: string | null;
  ats_score: number | null;
  match_score: number | null;
  match_reasons: { factor: string; impact: string; detail: string }[] | null;
  source: JobSource;
  external_job_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── External Job (normalized from TheirStack / Adzuna / Remotive) ────────────

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  is_remote: boolean;
  job_type?: JobType;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description: string;
  required_skills: string[];
  url: string;
  source: "theirstack" | "adzuna" | "remotive" | "mock";
  posted_at: string;
  match_score?: number;
  match_reasons?: { factor: string; impact: string; detail: string }[];
}

// ─── User Job Preferences ─────────────────────────────────────────────────────

export interface UserJobPreferences {
  id: string;
  user_id: string;
  locations: string[];
  skills: string[];
  target_roles: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  job_type: "any" | JobType;
  alert_email: boolean;
  alert_whatsapp: boolean;
  alert_frequency: "daily" | "weekly" | "never";
  industries: string[];
  created_at: string;
  updated_at: string;
}

// ─── Kanban / UI State ────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; borderColor: string; emoji: string }
> = {
  saved: {
    label: "Saved",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    emoji: "🔖",
  },
  applied: {
    label: "Applied",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    emoji: "📤",
  },
  phone_screen: {
    label: "Phone Screen",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950",
    borderColor: "border-violet-200 dark:border-violet-800",
    emoji: "📞",
  },
  interview: {
    label: "Interview",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    emoji: "🎯",
  },
  offer: {
    label: "Offer",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    emoji: "🎉",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    emoji: "❌",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "text-gray-500 dark:text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-900",
    borderColor: "border-gray-200 dark:border-gray-800",
    emoji: "↩️",
  },
};

export const ALL_STATUSES: JobStatus[] = [
  "saved",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];
