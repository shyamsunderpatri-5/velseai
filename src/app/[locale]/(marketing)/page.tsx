"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight,
  Target,
  Zap,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Circle,
  ChevronDown,
  MousePointer2,
  BarChart4,
  Cpu,
  Fingerprint,
  ShieldCheck
} from "lucide-react";
import { ATSCheckerForm } from "@/components/ats/ATSCheckerForm";
import { ScoreGauge } from "@/components/ats/ScoreGauge";
import { ATSScoreCard } from "@/components/ats/ATSScoreCard";
import { KeywordAnalysis } from "@/components/ats/KeywordAnalysis";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ATSResult {
  overall_score: number;
  keyword_score: number;
  format_score: number;
  skills_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  hard_skills_matched: string[];
  hard_skills_missing: string[];
  ats_issues: string[];
  suggestions: {
    high_priority: string[];
    medium_priority: string[];
    low_priority: string[];
  };
  summary?: string;
  experience_score: number;
  seniority_analysis: string;
  readability_analysis: string;
  impact_score: number;
  processingTime: number;
}

export default function HomePage() {
  const [result, setResult] = React.useState<ATSResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": crypto.randomUUID(),
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || "Failed to analyze resume");
      }

      setResult(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Elite Auto-Scroll Effect: Glide to results when they arrive
  React.useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100); // Small delay to ensure React has finished rendering the results section
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-[#050506] text-white overflow-x-hidden">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-6 md:pt-8 pb-10">
        <div className="container mx-auto px-4 relative">
          {/* SEO Optimized Hero Header */}
          <div className="max-w-4xl mx-auto text-center mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-violet-600/10 text-violet-400 border-violet-500/20 px-3 py-1 mb-2 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1.5" />
                #1 FREE ATS RESUME CHECKER
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xl md:text-3xl font-black mb-1 leading-tight tracking-tighter"
            >
              Free <span className="text-gradient">ATS Resume Checker</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-zinc-500 max-w-xl mx-auto mb-6 font-medium leading-normal"
            >
              Master the ATS with the <span className="text-white font-black px-2 py-0.5 rounded bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/20">$9 Job Search Sprint Pass</span>. Unlimited AI scans for 30 days.
            </motion.p>
          </div>

          {/* Privacy Corner Badge */}
          <div className="absolute top-24 left-4 z-10">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl shadow-xl shadow-emerald-500/10 transition-all hover:scale-105 active:scale-95 cursor-default">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-emerald-400 uppercase tracking-[0.15em] leading-none">Privacy Shield Active</span>
                <span className="text-[9px] font-bold text-emerald-400/80 uppercase leading-none mt-1 opacity-90">In-Memory Processing Only</span>
              </div>
            </div>
          </div>

          {/* Beta Corner Badge */}
          <div className="absolute top-24 right-4 z-10">
            <div className="px-2 py-0.5 rounded border border-white/5 bg-white/5 backdrop-blur-md text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              Beta v1.0.4
            </div>
          </div>

          {/* Instant Scanner Module - MOVED UP FOR ZERO-SCROLL VISIBILITY */}
          <div id="mission-control" className="scroll-mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-5xl mx-auto relative group mb-8"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-[1.5rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />
              <div className="relative rounded-[1.5rem] border border-white/10 bg-[#0C0C0E]/95 backdrop-blur-2xl p-4 lg:p-4 overflow-hidden shadow-2xl">
                <div className="grid lg:grid-cols-5 gap-10">
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-violet-500" />
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Mission Control</h2>
                    </div>
                    <ATSCheckerForm 
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      error={error}
                      className="space-y-4"
                    />
                  </div>

                  <div className="lg:col-span-2 flex flex-col justify-center border-l border-white/5 pl-0 lg:pl-10 pt-10 lg:pt-0">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-violet-400" />
                          <p className="text-white font-black text-base uppercase tracking-tight">Live Benchmarking</p>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                          Strict 1-scan guest limit. Login for 3 additional lifetime checks.
                        </p>
                      </div>

                      <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Scan Status</span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase">Operational</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "AI Scan", icon: Cpu },
                            { label: "Keywords", icon: BarChart4 },
                            { label: "Formats", icon: FileText },
                            { label: "Privacy", icon: Shield },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                              <item.icon className="w-3.5 h-3.5 text-violet-400/60" />
                              <span className="text-[10px] font-bold text-white/50">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                id="results-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto mb-24 space-y-10 pt-10 scroll-mt-24"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Analysis Complete</h2>
                  <p className="text-zinc-500 text-sm font-medium">Score high? Land the interview. Score low? Optimize now.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="rezi-card p-10 bg-white/[0.02] border-white/5 flex flex-col items-center col-span-1">
                    <ScoreGauge score={result.overall_score} size="lg" />
                    <div className="mt-8 text-center px-4">
                      <div className="text-5xl font-black text-white mb-2">{result.overall_score}%</div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-0.5 font-black uppercase tracking-widest text-[9px] mb-4">
                        ATS MATCH SCORE
                      </Badge>
                      <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
                        {result.summary}
                      </p>
                    </div>
                  </div>

                  <ATSScoreCard 
                    score={result.overall_score}
                    subScores={[
                      { label: "Keywords", value: result.keyword_score, icon: <Zap className="w-4 h-4 text-violet-400" /> },
                      { label: "Formatting", value: result.format_score, icon: <Shield className="w-4 h-4 text-blue-400" /> },
                      { label: "Skills Map", value: result.skills_score, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
                      { label: "Seniority Fit", analysis: result.seniority_analysis, icon: <Clock className="w-4 h-4 text-fuchsia-400" /> },
                      { label: "Readability", analysis: result.readability_analysis, icon: <MessageCircle className="w-4 h-4 text-blue-400" /> },
                      { label: "Impact & Verbs", value: result.impact_score, icon: <Sparkles className="w-4 h-4 text-warning" /> },
                    ]}
                  />
                </div>

                <div className="rezi-card p-8 bg-white/[0.02] border-white/5">
                  <KeywordAnalysis 
                    matchedKeywords={result.matched_keywords}
                    missingKeywords={result.missing_keywords}
                    hardSkillsMatched={result.hard_skills_matched}
                    hardSkillsMissing={result.hard_skills_missing}
                  />
                </div>

                <div className="flex flex-col items-center gap-6 pt-10">
                  <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Upgrade for unlimited detailed optimizations.</p>
                  <Link href="/auth/signup">
                    <Button size="lg" className="h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.05]">
                      CLIEM 3 MORE FREE CHECKS
                      <ArrowRight className="w-5 h-5 ml-3 stroke-[3]" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEO Content Sections - ADDED FOR BETTER GOOGLE RANKING */}
          <section className="grid md:grid-cols-3 gap-12 py-20 border-t border-white/5">
            <article className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Professional ATS Scanner</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Our free ATS resume checker uses advanced natural language processing (NLP) to benchmark your resume against real-world job descriptions. Land on the first page of recruiter results.
              </p>
            </article>
            <article className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Keyword Optimization</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Discover exactly which missing keywords are triggering filter rejections. Our scanner identifies hard skills, soft skills, and experience gaps in under 2 seconds.
              </p>
            </article>
            <article className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Format Verification</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Avoid the layout traps of multi-column templates and complex tables that confuse legacy ATS systems. We ensure your resume is 100% readable by every enterprise scanner.
              </p>
            </article>
          </section>

          {/* Social Proof / Certification */}
          <div className="flex flex-wrap justify-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 py-16 border-t border-white/5 opacity-50">
            <div className="flex items-center gap-2">
              <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
              <span>Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
              <span>GDRP Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
              <span>AI Core 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 bg-[#050506] border-t border-white/5">
        <div className="container mx-auto px-4 text-center space-y-10">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <span className="text-white font-black text-base">V</span>
            </div>
            <span className="font-heading font-black text-xl text-white tracking-tighter">VELSEAI</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 max-w-sm mx-auto leading-loose">
            © 2026 VELSEAI CORE. MISSION CRITICAL CAREER SOFTWARE.
          </p>
        </div>
      </footer>
    </div>
  );
}