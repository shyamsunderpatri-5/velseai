"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface BulletFix {
  original: string;
  rewritten: string;
  improvement_reason: string;
  keywords_added: string[];
}

interface FixSection {
  section: string;
  bullets: BulletFix[];
}

interface FixGuideTableProps {
  improvedSummary?: string;
  sections: FixSection[];
}

export function FixGuideTable({ improvedSummary, sections }: FixGuideTableProps) {
  const [expandedSection, setExpandedSection] = React.useState<string | null>("experience");
  const [copiedIndex, setCopiedIndex] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Intelligence Copied to Clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Optimization Protocol</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Direct Logic Upgrades for 90%+ ATS Match</p>
        </div>
      </div>

      {improvedSummary && (
        <div className="p-6 bg-[#0F0F12] border border-violet-500/20 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-12 h-12 text-violet-500" />
          </div>
          <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Professional Summary Synthesis
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed font-medium">
            {improvedSummary}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleCopy(improvedSummary, "summary")}
            className="mt-6 h-9 px-4 bg-white/5 hover:bg-violet-600 hover:text-white border border-[#2D313F] text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            {copiedIndex === "summary" ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
            Copy Summary
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.section} className="bg-[#1A1C26] border border-[#2D313F] rounded-2xl overflow-hidden transition-all">
            <button
              onClick={() => setExpandedSection(expandedSection === section.section ? null : section.section)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                  <span className="text-[10px] font-black text-violet-400 uppercase">{section.section[0]}</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">{section.section} Upgrades</h4>
              </div>
              {expandedSection === section.section ? (
                <ChevronUp className="w-4 h-4 text-zinc-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            <AnimatePresence>
              {expandedSection === section.section && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="space-y-4 pt-2">
                    {section.bullets.map((bullet, idx) => (
                      <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Original */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Original State</span>
                          <p className="text-xs text-zinc-500 leading-relaxed italic line-through opacity-50">
                            {bullet.original}
                          </p>
                        </div>
                        
                        {/* Rewritten */}
                        <div className="p-4 bg-violet-600/5 border border-violet-500/20 rounded-xl relative group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Optimized Protocol
                            </span>
                            <button 
                              onClick={() => handleCopy(bullet.rewritten, `${section.section}-${idx}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-violet-600 rounded-lg text-white"
                            >
                              {copiedIndex === `${section.section}-${idx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs text-white leading-relaxed font-bold">
                            {bullet.rewritten}
                          </p>
                          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                            {bullet.keywords_added.map(kw => (
                              <span key={kw} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-tighter">
                                + {kw}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex items-start gap-2 text-[10px] text-zinc-500 font-medium">
                            <AlertCircle className="w-3 h-3 mt-0.5 text-violet-400 flex-shrink-0" />
                            <span>{bullet.improvement_reason}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/10 text-center">
        <h5 className="text-sm font-bold text-white mb-2">Ready to apply with these fixes?</h5>
        <p className="text-[10px] text-zinc-500 font-medium mb-6">Copy the optimized lines into your resume file for an immediate match score increase.</p>
        <div className="flex items-center justify-center gap-4">
           {/* Placeholder for Instant PDF button */}
           <div id="pdf-fast-track-anchor" />
        </div>
      </div>
    </div>
  );
}
