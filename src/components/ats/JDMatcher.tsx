"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  FileSearch, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Brain,
  Zap
} from "lucide-react";
import { useResumeStore } from "@/stores/resumeStore";

export function JDMatcher() {
  const { analysisResults, content, setAnalysisResults, setJobDescription } = useResumeStore();
  const [jd, setJdLocal] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);

  // Sync JD to global store whenever it changes so FixAllBanner can read it
  const handleJdChange = (value: string) => {
    setJdLocal(value);
    setJobDescription(value);
  };

  const runAnalysis = async () => {
    if (!jd.trim()) return;
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-resume-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resume: content,
          jobDescription: jd 
        }),
      });
      const data = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error("Match analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const match = analysisResults?.match;

  return (
    <div className="space-y-6">
      {/* JD Input Area */}
      {!match && !analyzing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-violet-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Job Protocol</h3>
          </div>
          <div className="relative group">
            <textarea
              value={jd}
              onChange={(e) => handleJdChange(e.target.value)}
              placeholder="Paste Job Description here to analyze compatibility..."
              className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[11px] text-white/70 placeholder:text-white/10 focus:outline-none focus:border-violet-500/30 transition-all resize-none font-medium leading-relaxed"
            />
            <div className="absolute bottom-4 right-4 group-focus-within:opacity-100 opacity-50 transition-all">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
          </div>
          <button
            onClick={runAnalysis}
            disabled={!jd.trim() || analyzing}
            className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            Run Compatibility Scan
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <Brain className="w-12 h-12 text-violet-500 animate-pulse mx-auto mb-6" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-2">Calculating Fit</h3>
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Cross-referencing keywords...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Match Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Target className="w-24 h-24" />
                </div>
                
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em] mb-4">Compatibility Score</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-black text-white leading-none">{match?.match_score}</span>
                    <span className="text-xl font-black text-white/20 mb-1">%</span>
                    <div className={cn(
                      "ml-auto px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      match?.match_level === "excellent" ? "bg-emerald-500/20 text-emerald-400" :
                      match?.match_level === "good" ? "bg-blue-500/20 text-blue-400" :
                      "bg-amber-500/20 text-amber-400"
                    )}>
                      {match?.match_level}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                    {match?.recommendation}
                  </p>
                </div>
              </div>

              {/* Missing Skills Gap */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Critical Gaps</h4>
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">{match?.missing_skills.length} Missing</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {match?.missing_skills.map((skill, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold text-red-200/50 uppercase tracking-wider">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Skills */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Matched Keywords</h4>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{match?.matching_skills.length} Found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {match?.matching_skills.map((skill, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-200/50 uppercase tracking-wider">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailoring Advice */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Tailoring Advice</h4>
                <div className="space-y-2">
                  {match?.tailoring_tips.map((tip, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                      <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                      <p className="text-[10px] text-white/50 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  setAnalysisResults(null as never);
                  setJdLocal("");
                  setJobDescription("");
                }}
                className="w-full py-4 border border-white/5 text-white/20 font-black text-[9px] uppercase tracking-[0.3em] rounded-xl hover:text-white/40 transition-all mt-8"
              >
                Reset Match Protocol
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
