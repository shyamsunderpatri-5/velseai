"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Search, 
  Zap, 
  Loader2, 
  AlertCircle, 
  LayoutGrid,
  Sparkles,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useComparisonStore } from "@/stores/comparisonStore";
import { useResumeStore } from "@/stores/resumeStore";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export function MultiJDMatcher() {
  const { 
    jobs, 
    addJob, 
    removeJob, 
    clearJobs, 
    isBatchAnalyzing,
    setJobAnalyzing,
    setJobAnalysis,
    setJobError,
    setBatchAnalyzing
  } = useComparisonStore();
  
  const { content: resumeContent } = useResumeStore();
  const [newJdRaw, setNewJdRaw] = React.useState("");

  const handleAddJob = () => {
    if (newJdRaw.trim().length < 50) {
      toast.error("Job description must be at least 50 characters.");
      return;
    }
    if (jobs.length >= 5) {
      toast.error("Maximum 5 job targets allowed for comparison.");
      return;
    }
    addJob(newJdRaw);
    setNewJdRaw("");
  };

  const runBatchAnalysis = async () => {
    if (jobs.length === 0) return;
    setBatchAnalyzing(true);

    // Convert resume content to text for the API (if needed)
    // Actually our API expects either JSON or text. Let's send text for consistency with engine.
    const resumeText = JSON.stringify(resumeContent); 

    const unanalyzedJobs = jobs.filter(j => !j.analysis);
    
    const promises = unanalyzedJobs.map(async (job) => {
      setJobAnalyzing(job.id, true);
      try {
        const res = await fetch("/api/ats-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resumeText,
            jobDescription: job.description
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");
        setJobAnalysis(job.id, data);
      } catch (err: any) {
        setJobError(job.id, err.message);
      }
    });

    await Promise.all(promises);
    setBatchAnalyzing(false);
    toast.success("Viral Analysis Protocol Complete ✦");
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/10 flex items-center justify-center border border-violet-500/20">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Multi-Job Target Array</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Viral Expansion Protocol • Up to 5 Targets</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 flex items-center gap-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {jobs.length} / 5 Loaded
            </span>
          </div>
        </div>

        <div className="relative group">
          <Textarea 
            placeholder="Paste Job Description for comparison..."
            value={newJdRaw}
            onChange={(e) => setNewJdRaw(e.target.value)}
            className="min-h-[120px] bg-black/40 border-white/5 rounded-3xl p-5 text-xs text-white/70 focus:border-violet-500/50 transition-all resize-none italic"
          />
          <Button 
            onClick={handleAddJob}
            disabled={!newJdRaw.trim() || isBatchAnalyzing}
            className="absolute bottom-4 right-4 h-10 px-6 bg-white text-black hover:bg-violet-600 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Load Target
          </Button>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="group relative p-5 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all overflow-hidden"
            >
              {/* Status Indicator */}
              <div className="absolute top-0 right-0 p-4">
                {job.isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
                ) : job.analysis ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                ) : job.error ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 uppercase tracking-tighter">
                    T{idx + 1}
                  </div>
                  <h4 className="text-xs font-black text-white/80 uppercase tracking-widest truncate max-w-[120px]">
                    {job.title}
                  </h4>
                </div>

                <p className="text-[10px] text-white/20 font-medium line-clamp-3 leading-relaxed italic">
                  {job.description}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  {job.analysis ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-white">{job.analysis.overall_score}</span>
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">ATS</span>
                    </div>
                  ) : (
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">
                      Pending Scan
                    </div>
                  )}
                  
                  <button 
                    onClick={() => removeJob(job.id)}
                    className="p-2 rounded-lg bg-white/0 hover:bg-rose-500/10 text-white/10 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar (if analyzing) */}
              {job.isAnalyzing && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 bg-violet-600"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {jobs.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={runBatchAnalysis}
            disabled={isBatchAnalyzing || jobs.every(j => j.analysis)}
            className={cn(
              "p-5 rounded-[2rem] border border-dashed flex flex-col items-center justify-center gap-3 transition-all",
              isBatchAnalyzing 
                ? "border-violet-500/30 bg-violet-500/5 cursor-wait" 
                : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/40"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isBatchAnalyzing ? "bg-violet-600 text-white" : "bg-white/5 text-white/20"
            )}>
              {isBatchAnalyzing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Zap className="w-6 h-6" />
              )}
            </div>
            <div className="text-center">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                isBatchAnalyzing ? "text-violet-400" : "text-white/40"
              )}>
                {isBatchAnalyzing ? "Synthesizing Batch..." : "Execute Viral Match"}
              </p>
              {!isBatchAnalyzing && (
                <p className="text-[8px] text-white/10 font-bold uppercase tracking-widest mt-1">
                  Parallel Engine Active
                </p>
              )}
            </div>
          </motion.button>
        )}
      </div>
    </div>
  );
}
