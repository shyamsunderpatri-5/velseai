/**
 * VelseAI — Zod Structured Output Schemas
 *
 * These schemas are used with OpenAI's structured outputs (response_format: { type: 'json_schema' })
 * to guarantee deterministic, type-safe AI responses.
 *
 * Pattern: define Zod schema → infer TypeScript type → generate JSON schema for OpenAI.
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// ATS Score Result
// ─────────────────────────────────────────────

export const ATSSuggestionSchema = z.object({
  category: z.enum(["keywords", "format", "experience", "skills", "general"]),
  priority: z.enum(["high", "medium", "low"]),
  message: z.string(),
  action: z.string(),
});

export const KeywordFrameSchema = z.object({
  keyword: z.string(),
  sentence_frame: z.string(),
});

export const ATSScoreResultSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  keyword_score: z.number().int().min(0).max(100),
  format_score: z.number().int().min(0).max(100),
  experience_score: z.number().int().min(0).max(100),
  skills_score: z.number().int().min(0).max(100),
  missing_keywords: z.array(z.string()),
  matched_keywords: z.array(z.string()),
  keyword_frames: z.array(KeywordFrameSchema).optional(),
  suggestions: z.array(ATSSuggestionSchema),
  summary: z.string(),
  seniority_score: z.number().int().min(0).max(100).optional(),
  seniority_fit: z.boolean().optional(),
  seniority_reason: z.string().optional(),
});

export type ATSScoreResult = z.infer<typeof ATSScoreResultSchema>;

// ─────────────────────────────────────────────
// Elite 23-Metric Audit
// ─────────────────────────────────────────────

export const MetricAuditSchema = z.object({
  id: z.string(),
  status: z.enum(["pass", "fail", "warning"]),
  score: z.number().min(0).max(1),
  comment: z.string(),                  // Why it passed/failed
  suggestion: z.string().optional(),     // How to fix it (if failed/warning)
});

export const FullAuditSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  categories: z.object({
    foundational: z.array(MetricAuditSchema), // summary, contact, etc.
    impact: z.array(MetricAuditSchema),       // action_verbs, quantification, etc.
    formatting: z.array(MetricAuditSchema),   // length, fonts, etc.
    optimization: z.array(MetricAuditSchema), // keywords, tailoring, etc.
  }),
  top_priority_fixes: z.array(z.string()),
  executive_summary: z.string(),
});

export type FullAudit = z.infer<typeof FullAuditSchema>;

// ─────────────────────────────────────────────
// JD Vision Extraction (GPT-4o photo parser)
// ─────────────────────────────────────────────

export const JDExtractionSchema = z.object({
  company_name: z.string(),
  job_title: z.string(),
  location: z.string().optional(),
  salary_range: z.string().optional(),   // e.g. "€60,000–€80,000" — kept as string for locale flexibility
  job_type: z.enum(["full_time", "part_time", "contract", "remote", "hybrid", "unknown"]),
  required_skills: z.array(z.string()),
  nice_to_have_skills: z.array(z.string()),
  required_experience_years: z.number().optional(),
  education_requirement: z.string().optional(),
  key_responsibilities: z.array(z.string()),
  benefits: z.array(z.string()),
  application_deadline: z.string().optional(),
  contact_email: z.string().optional(),
  raw_text: z.string(),                   // Full OCR output preserved for ATS scoring
  confidence: z.number().min(0).max(1),   // Model's confidence in extraction quality
  language: z.enum(["en", "de", "fr", "es", "hi", "pt", "ar", "other"]),
});

export type JDExtraction = z.infer<typeof JDExtractionSchema>;

// ─────────────────────────────────────────────
// Resume Fix Result (JSON → JSON rewrite)
// ─────────────────────────────────────────────

export const RewrittenBulletSchema = z.object({
  original: z.string(),
  rewritten: z.string(),
  improvement_reason: z.string(),
  keywords_added: z.array(z.string()),
});

export const ResumeSectionFixSchema = z.object({
  section: z.enum(["summary", "experience", "skills", "education", "projects"]),
  rewritten_content: z.string(),          // Full section rewritten with keywords
  bullets: z.array(RewrittenBulletSchema).optional(),
});

export const ResumeFixResultSchema = z.object({
  improved_summary: z.string(),
  sections: z.array(ResumeSectionFixSchema),
  keywords_added: z.array(z.string()),
  estimated_new_score: z.number().int().min(0).max(100),
  changes_count: z.number().int(),
});

export type ResumeFixResult = z.infer<typeof ResumeFixResultSchema>;

// ─────────────────────────────────────────────
// Job Match Score
// ─────────────────────────────────────────────

export const JobMatchReasonSchema = z.object({
  factor: z.string(),                     // e.g. "React experience", "Location mismatch"
  impact: z.enum(["positive", "negative", "neutral"]),
  detail: z.string(),
});

export const JobMatchScoreSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  match_level: z.enum(["excellent", "good", "fair", "poor"]),
  reasons: z.array(JobMatchReasonSchema),
  missing_skills: z.array(z.string()),
  matching_skills: z.array(z.string()),
  recommendation: z.string(),             // One-line recommendation for the user
  tailoring_tips: z.array(z.string()),    // 3–5 specific resume tweaks for this job
});

export type JobMatchScore = z.infer<typeof JobMatchScoreSchema>;

export const FinalAnalysisSchema = z.object({
  audit: FullAuditSchema,
  match: JobMatchScoreSchema.optional(),
});

export type FinalAnalysis = z.infer<typeof FinalAnalysisSchema>;

// ─────────────────────────────────────────────
// Cover Letter Generated Output
// ─────────────────────────────────────────────

export const CoverLetterOutputSchema = z.object({
  subject_line: z.string(),              // Email subject if sending cold
  greeting: z.string(),
  body: z.string(),                      // Full letter body HTML-safe (no HTML tags)
  closing: z.string(),
  ats_keywords_included: z.array(z.string()),
  word_count: z.number().int(),
  locale_format: z.enum(["en_standard", "de_bewerbungsschreiben", "fr_lettre_motivation", "es_carta_presentacion", "generic"]),
});

export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

// ─────────────────────────────────────────────
// External Job (TheirStack / Adzuna normalized)
// ─────────────────────────────────────────────

export const ExternalJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  company_logo: z.string().optional(),
  location: z.string(),
  is_remote: z.boolean().default(false),
  job_type: z.enum(["full_time", "part_time", "contract", "remote", "hybrid"]).optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_currency: z.string().optional(),
  description: z.string(),
  required_skills: z.array(z.string()),
  url: z.string().url(),
  source: z.enum(["theirstack", "adzuna", "remotive", "mock"]),
  posted_at: z.string(),                  // ISO date string
  match_score: z.number().int().min(0).max(100).optional(),
  match_reasons: z.array(JobMatchReasonSchema).optional(),
});

export type ExternalJob = z.infer<typeof ExternalJobSchema>;

// ─────────────────────────────────────────────
// AI Chat Assistant (Editor Operations)
// ─────────────────────────────────────────────

/**
 * These actions represent atomic operations that the AI can perform on the resume state.
 * This turns the chat from a "consultant" into a "co-pilot/editor".
 */
export const AIChatActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("UPDATE_PERSONAL"),
    data: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      title: z.string().optional(),
      summary: z.string().optional(),
      website: z.string().optional(),
      linkedin: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("ADD_EXPERIENCE"),
    data: z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      isCurrent: z.boolean(),
      bulletPoints: z.array(z.string()),
    }),
  }),
  z.object({
    type: z.literal("UPDATE_EXPERIENCE"),
    data: z.object({
      id: z.string(),
      company: z.string().optional(),
      role: z.string().optional(),
      bulletPoints: z.array(z.string()).optional(),
    }),
  }),
  z.object({
    type: z.literal("ADD_SKILL"),
    data: z.object({
      category: z.string(),
      skills: z.array(z.string()),
    }),
  }),
  z.object({
    type: z.literal("UPDATE_SECTION_ORDER"),
    data: z.object({
      order: z.array(z.string()),
    }),
  }),
]);

export const AIChatResponseSchema = z.object({
  response: z.string(),                  // The text response to show the user
  suggested_actions: z.array(AIChatActionSchema), // State mutations to apply
  new_last_ats_score: z.number().int().optional(),
});

export type AIChatResponse = z.infer<typeof AIChatResponseSchema>;

// ─────────────────────────────────────────────
// Helper: Convert Zod schema to OpenAI JSON schema format
// ─────────────────────────────────────────────

/**
 * Minimal Zod-to-JSON-Schema converter for OpenAI structured outputs.
 * Only handles the subset of Zod types we use (object, string, number, array, enum, optional).
 * For production, consider using 'zod-to-json-schema' npm package.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (typeof schema === "string") return { type: "string" };
  
  const s = schema as any;
  const def = s._def || {};
  const kind = def.typeName || def.type;

  // Handle recursion into Arrays
  if (kind === 'ZodArray' || kind === 'array') {
    const items = def.element || def.type; // Extract element correctly for Zod 4
    return { 
      type: "array", 
      items: typeof items === "object" ? zodToJsonSchema(items) : { type: "string" } 
    };
  }

  // Handle recursion into Objects
  if (kind === 'ZodObject' || kind === 'object' || typeof s.shape === 'object') {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    const shape = s.shape || def.shape || (typeof def.shape === 'function' ? def.shape() : {});
    
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodTypeAny);
      const v = value as any;
      const vKind = v._def?.typeName || v._def?.type || v.type;
      if (vKind !== 'ZodOptional' && vKind !== 'optional') {
        required.push(key);
      }
    }
    return { type: "object", properties, required };
  }

  // Handle Enums
  if (kind === 'ZodEnum' || kind === 'enum') {
    return { type: "string", enum: def.values || s.options || [] };
  }

  // Handle Wrappers (Optional, Default, Nullable)
  if (def.innerType) {
    return zodToJsonSchema(def.innerType);
  }
  if (s.unwrap) {
    return zodToJsonSchema(s.unwrap());
  }

  // Primitives
  if (kind === 'ZodBoolean' || kind === 'boolean') return { type: "boolean" };
  if (kind === 'ZodNumber' || kind === 'number') return { type: "number" };
  
  return { type: "string" };
}
