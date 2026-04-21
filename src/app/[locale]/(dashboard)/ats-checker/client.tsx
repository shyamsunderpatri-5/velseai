"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ATSCheckerForm } from "@/components/ats/ATSCheckerForm";
import { ScoreGauge } from "@/components/ats/ScoreGauge";
import { ATSScoreCard } from "@/components/ats/ATSScoreCard";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Users,
  Zap,
  Shield,
  MessageCircle,
  ChevronDown,
  Sparkles,
  FileText,
  FileSearch,
  ShieldCheck,
  Wand2,
  RadioTower,
  Loader2 as Spinner,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ScoreRadarChart } from "@/components/ats/ScoreRadarChart";
import { Top3FixesCard } from "@/components/ats/Top3FixesCard";
import { FixGuideTable } from "@/components/ats/FixGuideTable";
import { MissingIntelligenceTable } from "@/components/ats/MissingIntelligenceTable";
import { DeepAnalysisSection } from "@/components/ats/DeepAnalysisSection";

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

interface FixResult {
  improved_summary: string;
  sections: FixSection[];
  keywords_added: string[];
  estimated_new_score: number;
}

interface ATSResult {
  overall_score: number;
  keyword_score: number;
  format_score: number;
  skills_score: number;
  experience_score: number;
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
  experience_years_found: number | null;
  experience_years_required: number | null;
  processingTime: number;
  seniority_analysis: string;
  readability_analysis: string;
  readability_score: number;
  impact_score: number;
  resumeId?: string;
  isGated?: boolean;
  mismatch_message?: string;
  keyword_frames?: { keyword: string; sentence_frame: string }[];
  summary?: string;
}




export function ATSCheckerClient() {
  const t = useTranslations("atsChecker");
  const locale = useLocale();
  const [result, setResult] = React.useState<ATSResult | null>(null);
  const [fixResult, setFixResult] = React.useState<FixResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [scanCount, setScanCount] = React.useState(0);
  const [lastData, setLastData] = React.useState<any>(null);
  const [activeResumeId, setActiveResumeId] = React.useState<string | null>(null);
  const supabase = createClient();

  // Load scan count from localStorage on mount
  React.useEffect(() => {
    const savedCount = localStorage.getItem("velseai_scans");
    if (savedCount) setScanCount(parseInt(savedCount, 10));
  }, []);

  const handleSubmit = async (data: {
    resumeText?: string;
    resumeFile?: string;
    jobDescription: string;
    companyName?: string;
    jobTitle?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      setLastData(data);
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
        throw new Error(responseData.message || responseData.error || t("errorFailed"));
      }

      setResult(responseData);
      
      const newCount = scanCount + 1;
      setScanCount(newCount);
      localStorage.setItem("velseai_scans", newCount.toString());

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const generateOptimizationProtocol = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Protocol: Authenticated access required for Optimization Protocol.");
      return;
    }

    if (!result || !lastData) return;

    setIsGenerating(true);
    toast.loading("VELSEAI Protocol: Synthesizing Sentence Frames...", { id: "tailoring" });

    try {
      let resumeId = result.resumeId;

      if (!resumeId) {
        const { data: latestResume } = await supabase
          .from("resumes")
          .select("id")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        resumeId = latestResume?.id;
      }

      if (!resumeId) throw new Error("No source asset found for synthesis. Please perform a fresh scan.");
      setActiveResumeId(resumeId);

      const fixRes = await fetch("/api/ai/fix-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          resumeText: lastData.resumeText,
          jobDescription: lastData.jobDescription,
          mode: "full_resume"
        }),
      });

      const fixData = await fixRes.json();
      if (!fixRes.ok) throw new Error(fixData.error || "Synthesis failed.");

      setFixResult(fixData);
      toast.success("Synthesis Complete: Exact Sentence Frames Available", { id: "tailoring" });
    } catch (err: any) {
      toast.error(err.message || "Synthesis Protocol Fault.", { id: "tailoring" });
    } finally {
      setIsGenerating(false);
    }
  };

  // Single-mode only — Discovery and Outreach are dedicated sidebar pages

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Page header badge */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Privacy Shield Active</span>
        </div>
      </div>

      {/* Core Scanner — Form + Results side by side */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          {scanCount > 0 && !result && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/40">
                    <Zap className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-tight">Unlock The $9 Sprint Pass</h4>
                    <p className="text-[9px] text-white/50 uppercase tracking-[0.2em]">Unlimited AI Audits • 30 Day Access</p>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button size="sm" className="bg-white text-black hover:bg-white/90 font-black text-[9px] h-8 px-4 rounded-xl uppercase tracking-widest">
                    ACTIVATE
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden rounded-[2rem]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
                {result ? "Refine Protocol" : "Deep Audit Initiator"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ATSCheckerForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                initialValue={lastData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card className={cn(
          "bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-2xl transition-all duration-700 overflow-hidden rounded-[2rem]",
          !result && "opacity-50 grayscale select-none pointer-events-none"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-violet-500" />
              </div>
              {result ? "Neural Audit Results" : "Awaiting Strategy Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="bg-white/[0.01] rounded-[2rem] border border-white/5 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-20 h-20" />
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">Neural match score</div>
                    <div className="text-8xl font-black text-white tracking-tighter">
                      {Math.round(result.overall_score)}<span className="text-violet-500 text-4xl">%</span>
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]",
                      result.overall_score >= 90 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                      result.overall_score >= 75 ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
                      "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    )}>
                      {result.overall_score >= 90 ? "ELITE PROTOCOL: PROCEED" :
                       result.overall_score >= 75 ? "EXPERT PROTOCOL: OPTIMIZE" :
                       "STANDARD PROTOCOL: NEEDS WORK"}
                    </div>
                    <Progress value={result.overall_score} className="w-64 h-2 bg-zinc-900" />
                  </div>
                </div>
                <ATSScoreCard
                  score={result.overall_score}
                  subScores={[
                    { label: "Keyword Match", value: result.keyword_score, icon: <Zap className="w-3.5 h-3.5" /> },
                    { label: "Institutional Format", value: result.format_score, icon: <Shield className="w-3.5 h-3.5" /> },
                    { label: "Skills Radar", value: result.skills_score, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
                    { label: "Market Impact", value: result.impact_score || 0, icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
                  ]}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileSearch className="w-8 h-8 text-white/10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-white uppercase tracking-tight">Initiate Audit Protocol</h3>
                  <p className="text-white/40 max-w-xs mx-auto text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Paste your resume and target JD to reveal neural match intelligence
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deep Analysis — renders below after scan */}
      {result && (
        <DeepAnalysisSection
          result={result}
          fixResult={fixResult}
          onGenerateProtocol={generateOptimizationProtocol}
          isGenerating={isGenerating}
          lastData={lastData}
        />
      )}
    </div>
  );
}

const faqs = [
  {
    q: "What is ATS?",
    a: "ATS (Applicant Tracking System) is software used by companies to screen resumes before they're seen by humans. It filters out candidates based on keywords, formatting, and other criteria.",
  },
  {
    q: "How does the free ATS checker work?",
    a: "Simply paste your resume and the job description you're targeting. Our AI analyzes keyword matching, format compatibility, and more to give you an ATS score out of 100.",
  },
  {
    q: "Is my data safe?",
    a: "Yes! Your resume data is processed securely and never shared. We don't store your resume permanently unless you create a free account.",
  },
  {
    q: "How can I improve my ATS score?",
    a: "Add missing keywords from the job description, use standard formatting, quantify your achievements, and ensure your resume is 1-2 pages with proper section headers.",
  },
  {
    q: "What score do I need to pass?",
    a: "An Expert score of 75+ is generally considered strong for mid-market roles. An Elite score of 90+ is recommended for FAANG or competitive global SaaS roles.",
  }
];
