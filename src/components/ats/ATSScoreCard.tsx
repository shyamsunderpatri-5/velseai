"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Target, FileText, Briefcase, Calendar, Sparkles, Zap } from "lucide-react";

interface SubScore {
  label: string;
  value?: number;
  analysis?: string;
  icon: React.ReactNode;
}

interface ATSScoreCardProps {
  score: number;
  subScores: SubScore[];
  className?: string;
}

export function ATSScoreCard({ score, subScores, className }: ATSScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 85) return "bg-emerald-500"; // Institutional Success
    if (value >= 70) return "bg-violet-600";  // VelseAI Brand
    if (value >= 40) return "bg-amber-500";   // Strategic Warning
    return "bg-rose-500";                    // Protocol Breach
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">
              Intelligence Quotient (IQ)
            </span>
            <div className="px-1.5 py-0.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-[8px] font-black text-violet-500 uppercase tracking-widest">
              Live Audit
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {score}%
          </div>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn("h-full transition-all duration-1000", getScoreColor(score))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {subScores.map((sub) => (
          <div
            key={sub.label}
            className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-violet-600/10 text-violet-500 group-hover:scale-110 transition-transform">
                    {sub.icon}
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    {sub.label}
                  </span>
                </div>
                {sub.value !== undefined && (
                  <span className="text-sm font-black text-white">
                    {sub.value}%
                  </span>
                )}
              </div>
              
              {sub.analysis ? (
                <p className="text-[10px] leading-relaxed text-zinc-500 font-bold uppercase tracking-wide line-clamp-4">
                  {sub.analysis}
                </p>
              ) : (
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.value}%` }}
                    className={cn("h-full", getScoreColor(sub.value || 0))}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const DEFAULT_SUBSCORES: SubScore[] = [
  {
    label: "Keyword Match",
    value: 0,
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "Format Score",
    value: 0,
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Skills Match",
    value: 0,
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: "Experience Match",
    value: 0,
    icon: <Briefcase className="w-4 h-4" />,
  },
];
