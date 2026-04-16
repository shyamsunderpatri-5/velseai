"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Zap,
  Layout,
  Type,
  Link2,
  Mail,
  User,
  Activity,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useResumeStore } from "@/stores/resumeStore";
import { motion, AnimatePresence } from "framer-motion";
import { MetricAudit } from "@/lib/ai/structured-outputs";

interface CategoryIconProps {
  id: string;
  status: string;
}

const CategoryIcon = ({ id, status }: CategoryIconProps) => {
  const iconMap: Record<string, any> = {
    foundational: User,
    impact: Zap,
    formatting: Layout,
    optimization: ShieldCheck,
  };
  const Icon = iconMap[id] || Brain;
  
  return (
    <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
      status === "pass" ? "bg-emerald-500/10 text-emerald-400" :
      status === "fail" ? "bg-red-500/10 text-red-400" :
      "bg-amber-500/10 text-amber-400"
    )}>
      <Icon className="w-4 h-4" />
    </div>
  );
};

export function ATSMetricsChecklist() {
  const { analysisResults, content, setAnalysisResults } = useResumeStore();
  const [analyzing, setAnalyzing] = React.useState(false);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-resume-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: content }),
      });
      const data = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!analysisResults && !analyzing) {
    return (
      <div className="py-20 text-center bg-white/[0.01] border border-white/5 rounded-[2rem] p-8">
        <Brain className="w-12 h-12 text-white/10 mx-auto mb-6" />
        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">Audit Required</h3>
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-8 max-w-[200px] mx-auto leading-relaxed">
          Initialize deep 23-metric scan to reveal ATS vulnerabilities
        </p>
        <button 
          onClick={runAnalysis}
          className="bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-full transition-all"
        >
          Initialize Protocol
        </button>
      </div>
    );
  }

  const categories = analysisResults?.audit.categories;

  return (
    <div className="space-y-8 pb-10">
      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-8">
              <motion.div 
                className="absolute inset-0 border-2 border-violet-500/20 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Loader2 className="w-20 h-20 text-violet-500 animate-spin-slow stroke-[1px]" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-2 animate-pulse">Running Auditor</h3>
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Scanning 23 Industry Metrics...</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status Report</p>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-lg font-black text-white">READY</span>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all" onClick={runAnalysis}>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Last Analysis</p>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-violet-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Rescan</span>
                </div>
              </div>
            </div>

            {/* Metrics by Category */}
            {categories && Object.entries(categories).map(([catId, metrics]) => (
              <div key={catId} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <CategoryIcon id={catId} status="neutral" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{catId}</h4>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="space-y-2">
                  {metrics.map((metric: MetricAudit) => (
                    <motion.div 
                      key={metric.id}
                      whileHover={{ x: 4 }}
                      className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all"
                    >
                      <div className="mt-1">
                        {metric.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        ) : metric.status === "fail" ? (
                          <XCircle className="w-4 h-4 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-white uppercase tracking-wider">{metric.id.replace("_", " ")}</span>
                          <ChevronRight className="w-3 h-3 text-white/5 group-hover:text-white/20 transition-all" />
                        </div>
                        <p className={cn(
                          "text-[10px] font-medium leading-relaxed mt-1",
                          metric.status === "pass" ? "text-white/30" : "text-white/60"
                        )}>
                          {metric.comment}
                        </p>
                        {metric.suggestion && (
                          <div className="mt-3 py-2 px-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                            <p className="text-[9px] text-violet-300 font-bold leading-relaxed">
                              <Zap className="w-2.5 h-2.5 inline mr-1" />
                              {metric.suggestion}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}