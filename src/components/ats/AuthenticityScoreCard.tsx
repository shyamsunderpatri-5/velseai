"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, Fingerprint, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Finding {
  factor: string;
  severity: "high" | "medium" | "low";
  issue: string;
  recommendation: string;
}

interface AuthenticityScoreCardProps {
  truthScore: number;
  verdict: "authentic" | "suspicious" | "high_risk";
  findings: Finding[];
  summary: string;
  className?: string;
}

export function AuthenticityScoreCard({
  truthScore,
  verdict,
  findings,
  summary,
  className
}: AuthenticityScoreCardProps) {
  const getVerdictStyle = () => {
    switch (verdict) {
      case "authentic": return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> };
      case "suspicious": return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> };
      case "high_risk": return { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: <ShieldAlert className="w-5 h-5 text-rose-500" /> };
      default: return { color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", icon: <Search className="w-5 h-5 text-zinc-500" /> };
    }
  };

  const style = getVerdictStyle();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & Score */}
      <div className={cn("p-6 rounded-[2rem] border backdrop-blur-3xl relative overflow-hidden", style.bg, style.border)}>
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Fingerprint className="w-24 h-24" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Forensic Integrity Scan</span>
          </div>

          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="377"
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 - (377 * truthScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={style.color}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{truthScore}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Truth Score</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className={cn("text-lg font-black uppercase tracking-widest", style.color)}>
              {verdict.replace("_", " ")}
            </h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">{summary}</p>
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
          <Search className="w-3 h-3" />
          Integrity Findings
        </h4>

        <div className="grid gap-3">
          {findings.map((finding, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                  finding.severity === "high" ? "bg-rose-500/10 text-rose-500" :
                  finding.severity === "medium" ? "bg-amber-500/10 text-amber-500" :
                  "bg-emerald-500/10 text-emerald-500"
                )}>
                  {finding.factor} • {finding.severity} Risk
                </span>
                <Info className="w-3 h-3 text-white/20" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">{finding.issue}</p>
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                  Recommendation: {finding.recommendation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
