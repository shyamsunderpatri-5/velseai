"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Terminal, 
  Briefcase, 
  TrendingUp, 
  Cpu, 
  Users, 
  Compass, 
  Coins, 
  Scaling,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NeuralAuditResult } from "@/lib/ats/auditor";

interface NeuralAuditDashboardProps {
  report: NeuralAuditResult;
  className?: string;
}

export function NeuralAuditDashboard({ report, className }: NeuralAuditDashboardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
      case "B": return "text-blue-400 border-blue-500/20 bg-blue-500/10";
      case "C": return "text-amber-400 border-amber-500/20 bg-amber-500/10";
      default: return "text-rose-400 border-rose-500/20 bg-rose-500/10";
    }
  };

  const getDimensionIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("role")) return <TargetIcon />;
    if (n.includes("company")) return <Briefcase className="w-4 h-4" />;
    if (n.includes("compensation") || n.includes("pay")) return <Coins className="w-4 h-4" />;
    if (n.includes("growth")) return <TrendingUp className="w-4 h-4" />;
    if (n.includes("tech")) return <Cpu className="w-4 h-4" />;
    if (n.includes("seniority")) return <Scaling className="w-4 h-4" />;
    if (n.includes("legitimacy")) return <ShieldCheck className="w-4 h-4" />;
    if (n.includes("flexibility")) return <Zap className="w-4 h-4" />;
    if (n.includes("function")) return <Terminal className="w-4 h-4" />;
    if (n.includes("culture")) return <Users className="w-4 h-4" />;
    return <Compass className="w-4 h-4" />;
  };

  return (
    <div className={cn("space-y-8 p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl", className)}>
      {/* ── HEADER: GLOBAL SCORE ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
                <circle 
                  cx="64" cy="64" r="58" 
                  className="stroke-white/5" 
                  strokeWidth="8" fill="transparent" 
                />
                <motion.circle 
                  cx="64" cy="64" r="58" 
                  className={cn("stroke-current", 
                    report.overall_score >= 4 ? "text-emerald-500" : 
                    report.overall_score >= 3.5 ? "text-blue-500" : "text-rose-500"
                  )}
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray={364}
                  initial={{ strokeDashoffset: 364 }}
                  animate={{ strokeDashoffset: 364 - (364 * (report.overall_score / 5)) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white italic">{report.overall_grade}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Grade</span>
             </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-black text-white uppercase tracking-tight">Neural Match 2.0</h2>
               <Badge className={cn("px-2 py-0 h-5 text-[8px] font-black uppercase tracking-widest", getGradeColor(report.overall_grade))}>
                  {report.archetype}
               </Badge>
            </div>
            <p className="text-xs text-zinc-400 font-bold max-w-md leading-relaxed">
              {report.strategic_advice}
            </p>
            <div className="flex items-center gap-3 pt-1">
               <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                    report.legitimacy_tier === "High Confidence" ? "bg-emerald-500" : "bg-amber-500")
                  } />
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Legitimacy: {report.legitimacy_tier}
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
          {report.red_flags.slice(0, 4).map((flag, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
               <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
               <span className="text-[9px] font-black text-rose-500 uppercase truncate max-w-[100px]">
                 {flag}
               </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── THE 10 DIMENSIONS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {report.dimensions.map((dim, i) => (
          <motion.div 
            key={dim.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors group cursor-default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-blue-400 transition-colors">
                  {getDimensionIcon(dim.name)}
                </div>
                <span className="text-xs font-black text-white">{dim.grade}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">
                  {dim.name}
                </p>
                <div className="flex gap-0.5 mt-2">
                  {[...Array(10)].map((_, idx) => (
                    <div 
                      key={idx} 
                      className={cn("h-1 w-full rounded-full transition-all duration-700", 
                        idx < dim.score ? "bg-blue-500/80" : "bg-white/5 shadow-inner"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── FOOTER: INTERVIEW INTELLIGENCE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
        <div className="md:col-span-1 space-y-4">
           <div className="flex items-center gap-2">
             <Star className="w-5 h-5 text-amber-500" />
             <h3 className="text-sm font-black text-white uppercase tracking-tighter">Protocol Advice</h3>
           </div>
           <p className="text-[11px] leading-relaxed text-zinc-400 font-medium italic">
             "To win this specific role, prioritize stories that demonstrate your ability to {report.archetype.toLowerCase()} in high-pressure environments."
           </p>
        </div>
        
        <div className="md:col-span-2">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Required Story Bank (STAR+R)</h3>
              <div className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                PRO RECOMMENDED
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.interview_master_stories.map((story, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                  <p className="text-[10px] text-zinc-400 font-bold leading-relaxed line-clamp-3">
                    {story}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function TargetIcon() {
 return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
 );
}
