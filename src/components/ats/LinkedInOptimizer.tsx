"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Copy, 
  Check, 
  Sparkles, 
  Lightbulb, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparisonStore } from "@/stores/comparisonStore";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export function LinkedInOptimizer() {
  const { jobs } = useComparisonStore();
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<string | null>(null);

  const optimizeForLinkedIn = async () => {
    const jobDescriptions = jobs.map(j => j.description);
    if (jobDescriptions.length === 0) {
      toast.error("Add at least one job target first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/linkedin-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescriptions })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");
      setResult(data);
      toast.success("LinkedIn Strategy Synthesized ✦");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard Protocol ✦");
  };

  if (!result && !loading) {
    return (
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0077b5]/10 to-violet-600/10 border border-[#0077b5]/20 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-[#0077b5] flex items-center justify-center shadow-[0_0_30px_rgba(0,119,181,0.3)]">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">LinkedIn Personal Brand AI</h3>
          <p className="text-xs text-white/40 max-w-sm leading-relaxed uppercase tracking-tighter font-bold">
            Extract the "Universal Skill Union" from your target targets to dominate LinkedIn search algorithms.
          </p>
        </div>
        <Button 
          onClick={optimizeForLinkedIn}
          disabled={jobs.length === 0}
          className="bg-[#0077b5] hover:bg-[#0077b5]/80 text-white font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-2xl transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" /> Analyze Market Signal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#0077b5] blur-[40px] opacity-20 animate-pulse" />
            <Briefcase className="w-12 h-12 text-[#0077b5] animate-bounce relative z-10" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] animate-pulse"> Calculating Market Overlaps... </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Keywords & Summary */}
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3 pl-1">
                <TrendingUp className="w-4 h-4 text-[#0077b5]" />
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Critical Skill Overlaps</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.top_keywords.map((keyword: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-white hover:border-[#0077b5]/40 transition-all cursor-default"
                  >
                    {keyword}
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 pl-1">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Headline Variations</h4>
              </div>
              <div className="space-y-3">
                {result.headline_variations.map((headline: string, i: number) => (
                  <div key={i} className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <p className="text-xs font-bold text-white/80 pr-10 leading-relaxed italic">"{headline}"</p>
                    <button 
                      onClick={() => copyToClipboard(headline, `head-${i}`)}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-white hover:bg-[#0077b5]"
                    >
                      {copiedIndex === `head-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Summary Optimization & Action */}
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3 pl-1">
                <Award className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">LinkedIn "About" Strategic Phrases</h4>
              </div>
              <div className="space-y-4">
                {result.about_phrases.map((phrase: string, i: number) => (
                  <div key={i} className="group flex items-start gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#0077b5]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-[#0077b5]" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <p className="text-xs text-white/60 leading-relaxed">{phrase}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(phrase, `about-${i}`)}
                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-[#0077b5] text-white/40 hover:text-white rounded-xl"
                      >
                        {copiedIndex === `about-${i}` ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                        Copy Phrase
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#0077b5] to-blue-700 space-y-4 shadow-2xl shadow-[#0077b5]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Market Alignment Summary</h4>
              </div>
              <p className="text-xs font-bold text-white/90 leading-relaxed italic">
                {result.analysis_summary}
              </p>
              <Button 
                onClick={() => setResult(null)}
                className="w-full bg-black text-white hover:bg-black/80 font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl"
              >
                Re-Analyze Market Signals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
