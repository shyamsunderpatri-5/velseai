import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// BASE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const PersonalInfoSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  portfolio: z.string().default(""),
  address: z.string().default(""),
  city: z.string().default(""),
  country: z.string().default(""),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  visaStatus: z.string().optional(),
});

export const ExperienceSchema = z.object({
  company: z.string().default(""),
  role: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  location: z.string().default(""),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

export const ProjectSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  link: z.string().default(""),
  achievements: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  startYear: z.string().default(""),
  endYear: z.string().default(""),
  grade: z.string().default(""),
});

export const SkillsSchema = z.object({
  technical: z.array(z.string()).default([]),
  soft: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]), // Programming languages or spoken languages, typically programming here
});

export const CertificateSchema = z.object({
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  link: z.string().default(""),
});

export const LanguageProficiencySchema = z.object({
  language: z.string().default(""),
  proficiency: z.string().default(""),
});

// ─────────────────────────────────────────────────────────────────────────────
// CORE EXPORT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const ExtractedResumeSchema = z.object({
  personal: PersonalInfoSchema,
  summary: z.string().default(""),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: SkillsSchema,
  certificates: z.array(CertificateSchema).default([]),
  languages: z.array(LanguageProficiencySchema).default([]),
  achievements: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  references: z.string().optional(),
  declaration: z.string().optional(),
  photoUrl: z.string().optional(), // Used if country needs a photo
});

export type ExtractedResume = z.infer<typeof ExtractedResumeSchema>;

// Alias for generated resume (since the structural schema is identical)
export const GeneratedResumeSchema = ExtractedResumeSchema;
export type GeneratedResume = z.infer<typeof GeneratedResumeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const CoverLetterSchema = z.object({
  header: z.object({
    applicantName: z.string(),
    applicantEmail: z.string(),
    applicantPhone: z.string(),
    date: z.string(),
  }),
  recipient: z.object({
    hiringManagerName: z.string(),
    companyName: z.string(),
    jobTitle: z.string(),
  }),
  body: z.object({
    openingParagraph: z.string(),
    bodyParagraph1: z.string(),
    bodyParagraph2: z.string(),
    bodyParagraph3: z.string(),
    closingParagraph: z.string(),
  }),
  signature: z.string(),
});

export type GeneratedCoverLetter = z.infer<typeof CoverLetterSchema>;
