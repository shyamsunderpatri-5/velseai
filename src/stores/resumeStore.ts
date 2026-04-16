import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ResumeContent,
  DEFAULT_RESUME_CONTENT,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
  Achievement,
} from "@/types/resume";
import { FinalAnalysis, ResumeFixResult } from "@/lib/ai/structured-outputs";

interface ResumeState {
  resumeId: string | null;
  title: string;
  content: ResumeContent;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  history: ResumeContent[];
  historyIndex: number;

  // Analysis State
  analysisResults: FinalAnalysis | null;
  lastAnalyzed: Date | null;

  // One-Click Fix Engine State
  pendingFixes: ResumeFixResult | null;
  isApplyingFixes: boolean;

  // Job Description (shared between JDMatcher and FixAllBanner)
  jobDescription: string;

  setResumeId: (id: string) => void;
  setTitle: (title: string) => void;
  setContent: (content: Partial<ResumeContent>) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;

  setAnalysisResults: (results: FinalAnalysis) => void;

  // One-Click Fix Engine Actions
  setPendingFixes: (fixes: ResumeFixResult | null) => void;
  applyBulletFix: (expId: string, bulletIdx: number, newBullet: string) => void;
  applyAllFixes: (fixes: ResumeFixResult) => void;

  // Job Description
  setJobDescription: (jd: string) => void;

  addExperience: () => void;
  updateExperience: (id: string, experience: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;
  reorderExperiences: (startIndex: number, endIndex: number) => void;

  addEducation: () => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addSkill: () => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  addLanguage: () => void;
  updateLanguage: (id: string, language: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  addAchievement: () => void;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => void;
  removeAchievement: (id: string) => void;

  updateSectionOrder: (order: string[]) => void;
  setSummary: (summary: string) => void;

  setSaving: (saving: boolean) => void;
  setSaved: () => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const generateId = () => crypto.randomUUID();

export const useResumeStore = create<ResumeState>()(
  immer((set, get) => ({
    resumeId: null,
    title: "Untitled Resume",
    content: DEFAULT_RESUME_CONTENT,
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    history: [DEFAULT_RESUME_CONTENT],
    historyIndex: 0,
    analysisResults: null,
    lastAnalyzed: null,
    pendingFixes: null,
    isApplyingFixes: false,
    jobDescription: "",

    setResumeId: (id) =>
      set((state) => {
        state.resumeId = id;
      }),

    setTitle: (title) =>
      set((state) => {
        state.title = title;
        state.isDirty = true;
      }),

    setAnalysisResults: (results) =>
      set((state) => {
        state.analysisResults = results;
        state.lastAnalyzed = new Date();
      }),

    setJobDescription: (jd) =>
      set((state) => {
        state.jobDescription = jd;
      }),

    setPendingFixes: (fixes) =>
      set((state) => {
        state.pendingFixes = fixes;
      }),

    // Replace a single bullet in-place. Used by per-bullet "Fix This" buttons.
    applyBulletFix: (expId, bulletIdx, newBullet) =>
      set((state) => {
        const exp = state.content.experience.find((e) => e.id === expId);
        if (exp && exp.bulletPoints[bulletIdx] !== undefined) {
          exp.bulletPoints[bulletIdx] = newBullet;
          state.isDirty = true;
        }
      }),

    // Batch-apply all fixes from a full ResumeFixResult (GPT-4o output).
    // Matches bullets by their original text and replaces with rewritten version.
    applyAllFixes: (fixes) =>
      set((state) => {
        state.isApplyingFixes = true;

        // 1. Apply improved summary
        if (fixes.improved_summary) {
          state.content.personal.summary = fixes.improved_summary;
        }

        // 2. Apply bullet rewrites across all experience entries
        fixes.sections.forEach((section) => {
          if (section.section === "experience" && section.bullets) {
            section.bullets.forEach((bulletFix) => {
              // Find the bullet by matching original text (trim for safety)
              const originalTrimmed = bulletFix.original.trim();
              for (const exp of state.content.experience) {
                const idx = exp.bulletPoints.findIndex(
                  (b) => b.trim() === originalTrimmed
                );
                if (idx !== -1) {
                  exp.bulletPoints[idx] = bulletFix.rewritten;
                  break;
                }
              }
            });
          }
        });

        state.isDirty = true;
        state.isApplyingFixes = false;
        state.pendingFixes = null;
      }),

    setContent: (content) =>
      set((state) => {
        state.content = { ...state.content, ...content };
        state.isDirty = true;
      }),

    updatePersonalInfo: (info) =>
      set((state) => {
        state.content.personal = { ...state.content.personal, ...info };
        state.isDirty = true;
      }),

    addExperience: () =>
      set((state) => {
        const newExperience: WorkExperience = {
          id: generateId(),
          company: "",
          role: "",
          startDate: "",
          endDate: null,
          isCurrent: false,
          bulletPoints: [""],
        };
        state.content.experience.push(newExperience);
        state.isDirty = true;
      }),

    updateExperience: (id, experience) =>
      set((state) => {
        const index = state.content.experience.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.content.experience[index] = {
            ...state.content.experience[index],
            ...experience,
          };
          state.isDirty = true;
        }
      }),

    removeExperience: (id) =>
      set((state) => {
        state.content.experience = state.content.experience.filter(
          (e) => e.id !== id
        );
        state.isDirty = true;
      }),

    reorderExperiences: (startIndex, endIndex) =>
      set((state) => {
        const [removed] = state.content.experience.splice(startIndex, 1);
        state.content.experience.splice(endIndex, 0, removed);
        state.isDirty = true;
      }),

    addEducation: () =>
      set((state) => {
        const newEducation: Education = {
          id: generateId(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        };
        state.content.education.push(newEducation);
        state.isDirty = true;
      }),

    updateEducation: (id, education) =>
      set((state) => {
        const index = state.content.education.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.content.education[index] = {
            ...state.content.education[index],
            ...education,
          };
          state.isDirty = true;
        }
      }),

    removeEducation: (id) =>
      set((state) => {
        state.content.education = state.content.education.filter(
          (e) => e.id !== id
        );
        state.isDirty = true;
      }),

    addSkill: () =>
      set((state) => {
        const newSkill: Skill = {
          id: generateId(),
          category: "Skills",
          skills: [],
        };
        state.content.skills.push(newSkill);
        state.isDirty = true;
      }),

    updateSkill: (id, skill) =>
      set((state) => {
        const index = state.content.skills.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.content.skills[index] = {
            ...state.content.skills[index],
            ...skill,
          };
          state.isDirty = true;
        }
      }),

    removeSkill: (id) =>
      set((state) => {
        state.content.skills = state.content.skills.filter((s) => s.id !== id);
        state.isDirty = true;
      }),

    addProject: () =>
      set((state) => {
        const newProject: Project = {
          id: generateId(),
          name: "",
          description: "",
          technologies: [],
          bulletPoints: [""],
        };
        state.content.projects.push(newProject);
        state.isDirty = true;
      }),

    updateProject: (id, project) =>
      set((state) => {
        const index = state.content.projects.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.content.projects[index] = {
            ...state.content.projects[index],
            ...project,
          };
          state.isDirty = true;
        }
      }),

    removeProject: (id) =>
      set((state) => {
        state.content.projects = state.content.projects.filter((p) => p.id !== id);
        state.isDirty = true;
      }),

    addCertification: () =>
      set((state) => {
        const newCert: Certification = {
          id: generateId(),
          name: "",
          issuer: "",
          issueDate: "",
        };
        state.content.certifications.push(newCert);
        state.isDirty = true;
      }),

    updateCertification: (id, certification) =>
      set((state) => {
        const index = state.content.certifications.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.content.certifications[index] = {
            ...state.content.certifications[index],
            ...certification,
          };
          state.isDirty = true;
        }
      }),

    removeCertification: (id) =>
      set((state) => {
        state.content.certifications = state.content.certifications.filter(
          (c) => c.id !== id
        );
        state.isDirty = true;
      }),

    addLanguage: () =>
      set((state) => {
        const newLang: Language = {
          id: generateId(),
          language: "",
          proficiency: "Professional",
        };
        state.content.languages.push(newLang);
        state.isDirty = true;
      }),

    updateLanguage: (id, language) =>
      set((state) => {
        const index = state.content.languages.findIndex((l) => l.id === id);
        if (index !== -1) {
          state.content.languages[index] = {
            ...state.content.languages[index],
            ...language,
          };
          state.isDirty = true;
        }
      }),

    removeLanguage: (id) =>
      set((state) => {
        state.content.languages = state.content.languages.filter(
          (l) => l.id !== id
        );
        state.isDirty = true;
      }),

    addAchievement: () =>
      set((state) => {
        const newAchievement: Achievement = {
          id: generateId(),
          title: "",
          description: "",
        };
        state.content.achievements.push(newAchievement);
        state.isDirty = true;
      }),

    updateAchievement: (id, achievement) =>
      set((state) => {
        const index = state.content.achievements.findIndex((a) => a.id === id);
        if (index !== -1) {
          state.content.achievements[index] = {
            ...state.content.achievements[index],
            ...achievement,
          };
          state.isDirty = true;
        }
      }),

    removeAchievement: (id) =>
      set((state) => {
        state.content.achievements = state.content.achievements.filter(
          (a) => a.id !== id
        );
        state.isDirty = true;
      }),

    updateSectionOrder: (order) =>
      set((state) => {
        state.content.sectionOrder = order;
        state.isDirty = true;
      }),

    setSummary: (summary) =>
      set((state) => {
        state.content.personal.summary = summary;
        state.isDirty = true;
      }),

    setSaving: (saving) =>
      set((state) => {
        state.isSaving = saving;
      }),

    setSaved: () =>
      set((state) => {
        state.isDirty = false;
        state.isSaving = false;
        state.lastSaved = new Date();
      }),

    reset: () =>
      set((state) => {
        state.content = DEFAULT_RESUME_CONTENT;
        state.isDirty = false;
        state.history = [DEFAULT_RESUME_CONTENT];
        state.historyIndex = 0;
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.content = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          state.isDirty = true;
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.content = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          state.isDirty = true;
        }
      }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
  }))
);
