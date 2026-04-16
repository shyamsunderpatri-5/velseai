import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { FinalAnalysis } from "@/lib/ai/structured-outputs";

interface ComparisonJob {
  id: string;
  title: string;
  description: string;
  analysis: FinalAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
}

interface ComparisonState {
  jobs: ComparisonJob[];
  isBatchAnalyzing: boolean;
  
  addJob: (description: string, title?: string) => void;
  removeJob: (id: string) => void;
  clearJobs: () => void;
  setJobAnalysis: (id: string, analysis: FinalAnalysis) => void;
  setJobError: (id: string, error: string | null) => void;
  setJobAnalyzing: (id: string, isAnalyzing: boolean) => void;
  setBatchAnalyzing: (isAnalyzing: boolean) => void;
}

export const useComparisonStore = create<ComparisonState>()(
  immer((set) => ({
    jobs: [],
    isBatchAnalyzing: false,

    addJob: (description, title) =>
      set((state) => {
        if (state.jobs.length >= 5) return;
        state.jobs.push({
          id: crypto.randomUUID(),
          title: title || `Target ${state.jobs.length + 1}`,
          description,
          analysis: null,
          isAnalyzing: false,
          error: null,
        });
      }),

    removeJob: (id) =>
      set((state) => {
        state.jobs = state.jobs.filter((j) => j.id !== id);
      }),

    clearJobs: () =>
      set((state) => {
        state.jobs = [];
      }),

    setJobAnalysis: (id, analysis) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === id);
        if (job) {
          job.analysis = analysis;
          job.isAnalyzing = false;
          job.error = null;
        }
      }),

    setJobError: (id, error) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === id);
        if (job) {
          job.error = error;
          job.isAnalyzing = false;
        }
      }),

    setJobAnalyzing: (id, isAnalyzing) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === id);
        if (job) {
          job.isAnalyzing = isAnalyzing;
        }
      }),

    setBatchAnalyzing: (isAnalyzing) =>
      set((state) => {
        state.isBatchAnalyzing = isAnalyzing;
      }),
  }))
);
