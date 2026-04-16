"use client";

import * as React from "react";
import { AlertCircle, ArrowUpCircle, BadgeCheck, Copy, Sparkles, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface MissingItem {
  category: "KEYWORD" | "SKILL" | "FORMAT" | "IMPACT";
  missing: string;
  recommendation: string;
  type: "keyword" | "skill" | "format" | "impact";
}

interface MissingIntelligenceTableProps {
  missingKeywords: string[];
  missingSkills: string[];
  keywordFrames?: { keyword: string; sentence_frame: string }[];
  suggestions: {
    high_priority: string[];
    medium_priority: string[];
  };
  atsIssues: string[];
}

export function MissingIntelligenceTable({ 
  missingKeywords, 
  missingSkills, 
  keywordFrames,
  suggestions,
  atsIssues 
}: MissingIntelligenceTableProps) {
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Optimization Protocol copied");
  };

  const allItems: MissingItem[] = [
    ...missingKeywords.map(kw => {
      const customFrame = keywordFrames?.find(kf => kf.keyword.toLowerCase() === kw.toLowerCase())?.sentence_frame;
      return {
        category: "KEYWORD" as const,
        missing: kw,
        recommendation: customFrame || `Integrate "${kw}" into your professional summary or experience bullets.`,
        type: "keyword" as const
      };
    }),
    ...missingSkills.map(sk => ({
      category: "SKILL" as const,
      missing: sk,
      recommendation: `Add "${sk}" to your Skills section or provide a specific project example.`,
      type: "skill" as const
    })),
    ...atsIssues.map(issue => ({
      category: "FORMAT" as const,
      missing: issue,
      recommendation: "Standardize naming conventions and remove decorative elements.",
      type: "format" as const
    })),
    ...suggestions.high_priority.map(s => ({
      category: "IMPACT" as const,
      missing: "Logic Audit",
      recommendation: s,
      type: "impact" as const
    }))
  ];

  if (allItems.length === 0) {
    return (
      <div className="p-12 text-center bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[2rem] animate-in fade-in zoom-in-95 duration-700">
        <BadgeCheck className="w-16 h-16 text-emerald-500/40 mx-auto mb-4" />
        <h4 className="text-white text-xl font-black uppercase tracking-tight">Institutional Alignment: 100%</h4>
        <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest">No Intelligence Gaps Detected in this Protocol</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#09090b]/40 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Missing Intelligence</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Optimization Protocol (Add This)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allItems.map((item, idx) => (
              <tr key={idx} className="group hover:bg-white/[0.02] transition-all duration-500">
                {/* Category Badge */}
                <td className="px-8 py-6 align-top">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border transition-all duration-500",
                    item.type === "keyword" && "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20",
                    item.type === "skill" && "bg-violet-500/10 text-violet-400 border-violet-500/20 group-hover:bg-violet-500/20",
                    item.type === "format" && "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500/20",
                    item.type === "impact" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20"
                  )}>
                    {item.category}
                  </span>
                </td>

                {/* Missing Item */}
                <td className="px-8 py-6 align-top">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-500/80 group-hover:scale-110 transition-transform" />
                    <span className="text-[15px] font-bold text-zinc-100 group-hover:text-white transition-colors leading-tight">
                      {item.missing}
                    </span>
                  </div>
                </td>

                {/* Protocol Call to Action */}
                <td className="px-8 py-6 align-top">
                  <div className="relative group/copy pr-12">
                    <p className="text-[14px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                      {item.recommendation}
                    </p>
                    <button 
                      onClick={() => handleCopy(item.recommendation)}
                      className="absolute top-[-4px] right-0 p-3 opacity-0 group-hover/copy:opacity-100 transition-all hover:bg-white/10 rounded-xl text-white/50 hover:text-white active:scale-90"
                      title="Copy Protocol"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Legend */}
      <div className="px-8 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Intelligence Gap</span>
            </div>
            <div className="flex items-center gap-2 text-amber-500/60">
               <Zap className="w-3 h-3" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Institutional Audit Engine Active</span>
            </div>
         </div>
         <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">VelseAI Alpha Protocol v2.4</span>
      </div>
    </div>
  );
}

