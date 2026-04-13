"use client";

import * as React from "react";
import Link from "next/link";
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
  },
];

export function ATSCheckerClient() {
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

  return (
    <div className="min-h-screen bg-[#0D0D12]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0D0D12]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-white">VELSEAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/ats-checker" className="text-sm font-medium text-white">
              ATS Checker
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white">
              Pricing
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                Get Started Free
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Is Your Resume{" "}
              <span className="text-accent">Passing the ATS Filter?</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              75% of resumes are auto-rejected before a human sees them.
              Check yours free — no signup needed.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-success" />
                <span className="text-sm">10,000+ resumes checked</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-sm">Results in 10 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">100% Free</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">
                  {result ? "Check Another Resume" : "Check Your ATS Score"}
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
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">
                  {result ? "Your ATS Analysis" : "Your Results Will Appear Here"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-8">
                    {/* Score Gauge */}
                    <div className="flex flex-col items-center py-4">
                      <ScoreGauge score={result.overall_score} size="lg" />
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Processed in {result.processingTime}ms
                      </p>
                    </div>

                    {/* Sub Scores */}
                    <ATSScoreCard
                      score={result.overall_score}
                      subScores={[
                        {
                          label: "Keyword Match",
                          value: result.keyword_score,
                          icon: <Zap className="w-4 h-4" />,
                        },
                        {
                          label: "Format Score",
                          value: result.format_score,
                          icon: <Shield className="w-4 h-4" />,
                        },
                        {
                          label: "Skills Match",
                          value: result.skills_score,
                          icon: <CheckCircle2 className="w-4 h-4" />,
                        },
                        {
                          label: "Experience",
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
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-warning" />
                          Top Fixes to Improve Your Score
                        </h4>
                        <ul className="space-y-2">
                          {result.suggestions.high_priority.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ATS Issues */}
                    {result.ats_issues.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          ATS Issues Found
                        </h4>
                        <ul className="space-y-2">
                          {result.ats_issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Want personalized improvements and AI-powered resume building?
                      </p>
                      <Link href="/auth/signup">
                        <Button className="w-full bg-accent hover:bg-accent/90">
                          Get Full Analysis + AI Resume Builder
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {/* WhatsApp Share */}
                    {result && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3 text-center">
                          Share your score with friends
                        </p>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Just checked my resume on VELSEAI and got ${result.overall_score}/100 ATS score! 🎯\n${result.missing_keywords?.slice(0, 3).join(', ') ? `Missing keywords: ${result.missing_keywords.slice(0, 3).join(', ')}\n` : ''}Check yours FREE (no signup needed): https://velseai.com/ats-checker`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-lg font-medium transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Share on WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                      <svg
                        className="w-12 h-12 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      Ready to analyze your resume?
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Paste your resume and a job description to get instant feedback on your ATS compatibility.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: "Paste Your Resume", desc: "Copy your resume text or upload a PDF" },
              { step: 2, title: "Add Job Description", desc: "Paste the job posting you're targeting" },
              { step: 3, title: "Get Instant Feedback", desc: "Receive your score and improvement tips" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-card rounded-lg border">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-muted-foreground text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 VELSEAI. Built for Indian job seekers.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
