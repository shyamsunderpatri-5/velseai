"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ATSCheckerForm } from "@/components/ats/ATSCheckerForm";
import { ScoreGauge } from "@/components/ats/ScoreGauge";
import { ATSScoreCard } from "@/components/ats/ATSScoreCard";
import { KeywordAnalysis } from "@/components/ats/KeywordAnalysis";
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
} from "lucide-react";

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
}


export function ATSCheckerClient() {
  const t = useTranslations("atsChecker");
  const locale = useLocale();
  const [result, setResult] = React.useState<ATSResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white">
      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="text-center mb-16 space-y-6">
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-4 py-1.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              {t("badge")}
            </Badge>
            <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {t("titleStart")}{" "}
              <span className="text-violet-500">{t("titleAccent")}</span>
            </h1>
            <p className="text-white/50 text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
              {t("subtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 animate-in fade-in duration-1000 delay-700">
              <div className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium text-white/70">{t("socialProof")}</span>
              </div>
              <div className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                <span className="text-sm font-medium text-white/70">{t("socialProofTime")}</span>
              </div>
              <div className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-white/70">{t("socialProofFree")}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
            {/* Input Form */}
            <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-500" />
                  </div>
                  {result ? t("formTitleAgain") : t("formTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ATSCheckerForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              </CardContent>
            </Card>

            {/* Results */}
            <Card className={cn(
              "bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-2xl transition-all duration-700 overflow-hidden",
              !result && "opacity-50 grayscale select-none pointer-events-none"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-500" />
                  </div>
                  {result ? t("resultTitle") : t("resultTitlePlaceholder")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {result ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    {/* Score Gauge */}
                    <div className="flex flex-col items-center py-6 bg-white/[0.02] rounded-3xl border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
                      <ScoreGauge score={result.overall_score} size="lg" />
                      <div className="text-center mt-6 space-y-1">
                        <p className="text-2xl font-bold text-white">
                          {result.overall_score >= 85 ? t("scoreExcellent") : result.overall_score >= 70 ? t("scoreGood") : t("scoreFair")}
                        </p>
                        <p className="text-sm text-white/40 uppercase tracking-widest font-semibold">
                          {t("processingTime")}: {result.processingTime}ms
                        </p>
                      </div>
                    </div>

                    {/* Sub Scores */}
                    <ATSScoreCard
                      score={result.overall_score}
                      subScores={[
                        {
                          label: t("keywordScore"),
                          value: result.keyword_score,
                          icon: <Zap className="w-4 h-4" />,
                        },
                        {
                          label: t("formatScore"),
                          value: result.format_score,
                          icon: <Shield className="w-4 h-4" />,
                        },
                        {
                          label: t("skillsScore"),
                          value: result.skills_score,
                          icon: <CheckCircle2 className="w-4 h-4" />,
                        },
                        {
                          label: t("experienceScore"),
                          value: result.experience_score,
                          icon: <Users className="w-4 h-4" />,
                        },
                      ]}
                    />

                    {/* Keywords */}
                    <KeywordAnalysis
                      matchedKeywords={result.matched_keywords}
                      missingKeywords={result.missing_keywords}
                      hardSkillsMatched={result.hard_skills_matched}
                      hardSkillsMissing={result.hard_skills_missing}
                    />

                    {/* Suggestions */}
                    {result.suggestions.high_priority.length > 0 && (
                      <div className="space-y-4 p-5 rounded-2xl bg-warning/5 border border-warning/10">
                        <h4 className="font-bold flex items-center gap-2.5 text-warning">
                          <Lightbulb className="w-5 h-5" />
                          {t("topFixes")}
                        </h4>
                        <ul className="space-y-3">
                          {result.suggestions.high_priority.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-6 space-y-4">
                      <Link href="/auth/signup">
                        <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-xl shadow-violet-600/20 group">
                          {t("upgradePrompt")}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      
                      {/* WhatsApp Share */}
                      <div className="pt-4 space-y-3">
                        <p className="text-sm text-white/40 text-center font-medium">
                          {t("shareTitle")}
                        </p>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            t("whatsappMessage", {
                              score: result.overall_score,
                              url: `https://velseai.com/${locale}/ats-checker`
                            })
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 w-full h-11 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <MessageCircle className="w-5 h-5" />
                          {t("shareWhatsApp")}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
                      <FileSearch className="w-12 h-12 text-white/20 relative z-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-heading font-bold text-xl text-white">
                        {t("placeholderTitle")}
                      </h3>
                      <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
                        {t("placeholderDesc")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-white/40">
              {t("howItWorksDesc")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: t("step1Title"), desc: t("step1Desc") },
              { step: 2, title: t("step2Title"), desc: t("step2Desc") },
              { step: 3, title: t("step3Title"), desc: t("step3Desc") },
            ].map((item) => (
              <div key={item.step} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-violet-500 text-white font-black text-xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 text-white">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold">{t("faqTitle")}</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white/[0.02] border border-white/5 rounded-2xl transition-all">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-white/80 group-hover:text-white transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-white/30" />
                </summary>
                <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-sm text-white/30 font-medium">
              © {currentYear} VELSEAI. {t("footerText")}
            </p>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-sm text-white/30 hover:text-violet-400 transition-colors font-medium">
                {t("privacy")}
              </Link>
              <Link href="/terms" className="text-sm text-white/30 hover:text-violet-400 transition-colors font-medium">
                {t("terms")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
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
    a: "A score of 75+ is generally considered passing. Scores above 85 significantly increase your chances of getting an interview.",
  }
];
