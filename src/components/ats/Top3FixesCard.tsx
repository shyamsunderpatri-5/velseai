"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Zap, Sparkles, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FixItem {
  message: string;
  category: string;
  points?: number;
}

interface Top3FixesCardProps {
  suggestions: string[];
  onFix?: (suggestion: string) => void;
  className?: string;
}

const CATEGORY_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  keywords: { icon: <Zap className="w-4 h-4" />, color: "text-amber-500" },
  format: { icon: <ShieldAlert className="w-4 h-4" />, color: "text-rose-500" },
  experience: { icon: <ArrowRight className="w-4 h-4" />, color: "text-violet-500" },
  skills: { icon: <Sparkles className="w-4 h-4" />, color: "text-emerald-500" },
  default: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-zinc-500" },
};

export function Top3FixesCard({ suggestions, onFix, className }: Top3FixesCardProps) {
  // Parse suggestions into structured objects if they aren't already
  const fixes: FixItem[] = suggestions.slice(0, 3).map((s) => {
    const isKeyword = s.toLowerCase().includes("keyword");
    const isFormat = s.toLowerCase().includes("format") || s.toLowerCase().includes("table") || s.toLowerCase().includes("image");
    const isExperience = s.toLowerCase().includes("verb") || s.toLowerCase().includes("quantify");
    const isSkill = s.toLowerCase().includes("skill");

    let category = "default";
    if (isKeyword) category = "keywords";
    else if (isFormat) category = "format";
    else if (isExperience) category = "experience";
    else if (isSkill) category = "skills";

    return {
      message: s,
      category,
      points: category === "keywords" ? 15 : category === "format" ? 10 : 5,
    };
  });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
          High Priority Protocol
        </h3>
        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">
          3 Critical Vulnerabilities
        </span>
      </div>

      <div className="space-y-3">
        {fixes.map((fix, i) => {
          const { icon, color } = CATEGORY_MAP[fix.category] || CATEGORY_MAP.default;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {icon}
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={cn("p-2.5 rounded-xl bg-white/5 flex-shrink-0 transition-transform group-hover:scale-110", color)}>
                    {icon}
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {fix.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", color)}>
                        +{fix.points} PTS GAIN
                      </span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        Estimated Impact
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFix?.(fix.message)}
                  className="w-full h-9 border border-white/5 bg-white/3 hover:bg-white/10 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                >
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  Apply Fix Protocol
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center px-6">
        ✦ Applying these fixes will synchronize your profile for Institutional Tier rejection-proof clearance.
      </p>
    </div>
  );
}
