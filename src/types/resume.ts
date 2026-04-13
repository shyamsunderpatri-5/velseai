export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  bulletPoints: string[];
  isRemote?: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements?: string[];
  coursework?: string[];
}

export interface Skill {
  id: string;
  category: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  bulletPoints: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Intermediate" | "Basic";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface ResumeContent {
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  achievements: Achievement[];
  sectionOrder: string[];
}

export interface ResumeSettings {
  templateId: string;
  primaryColor: string;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  spacing: "compact" | "normal" | "spacious";
  showPhoto: boolean;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  content: ResumeContent;
  settings: ResumeSettings;
  atsScore?: number;
  targetRole?: string;
  isPublic: boolean;
  publicSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
  sectionOrder: ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
};

export const DEFAULT_RESUME_SETTINGS: ResumeSettings = {
  templateId: "modern",
  primaryColor: "#1A1A2E",
  fontFamily: "DM Sans",
  fontSize: "medium",
  spacing: "normal",
  showPhoto: false,
};

export function createEmptyResumeContent(): ResumeContent {
  return JSON.parse(JSON.stringify(DEFAULT_RESUME_CONTENT));
}
