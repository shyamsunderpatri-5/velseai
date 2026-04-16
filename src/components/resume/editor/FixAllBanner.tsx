"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, Loader2, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";
import { ResumeFixResult } from "@/lib/ai/structured-outputs";
import toast from "react-hot-toast";

type FixStep =
  | "idle"
  | "fetching_jd"
  | "analyzing"
  | "fixing"
  | "review"
  | "applying"
  | "done";

const STEP_LABELS: Record<FixStep, string> = {
  idle: "",
  fetching_jd: "Reading job description...",
  analyzing: "Analyzing keyword gaps...",
  fixing: "Rewriting bullets with AI...",
  review: "Ready to review",
  applying: "Applying all fixes...",
  done: "All fixes applied!",
};

interface FixAllBannerProps {
  /** Job description text stored from JDMatcher / ATS checker */
  jobDescription?: string;
  className?: string;
}

export function FixAllBanner({ jobDescription, className }: FixAllBannerProps) {
  const {
    content,
    analysisResults,
    isApplyingFixes,
    applyAllFixes,
    setPendingFixes,
    pendingFixes,
  } = useResumeStore();

  const score = analysisResults?.audit.overall_score ?? 0;
  const missingKeywords = analysisResults?.audit.categories.optimization
    ?.flatMap((m) => (m.status === "fail" ? [m.comment] : []))
    .slice(0, 10) ?? [];

  const [step, setStep] = React.useState<FixStep>("idle");
  const [fixes, setFixes] = React.useState<ResumeFixResult | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // Only show when: score < 70, not dismissed, has experience data
  const shouldShow = score > 0 && score < 70 && !dismissed && content.experience.length > 0;

  const buildResumeText = (): string => {
    const lines: string[] = [];
    if (content.personal.summary) lines.push(content.personal.summary);
    for (const exp of content.experience) {
      lines.push(`${exp.role} at ${exp.company}`);
      lines.push(...exp.bulletPoints.filter(Boolean));
    }
    for (const sk of content.skills) {
      lines.push(sk.skills.join(", "));
    }
    return lines.join("\n");
  };

  const handleFixAll = async () => {
    const jd = jobDescription || "";
    if (!jd || jd.length < 50) {
      toast.error("Paste a job description in the Keyword Matcher first to use Fix All.", {
        duration: 4000,
        style: { background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" },
      });
      return;
    }

    setStep("fetching_jd");
    setProgress(10);

    try {
      const resumeText = buildResumeText();

      setStep("analyzing");
      setProgress(30);
      await new Promise((r) => setTimeout(r, 400)); // brief UX pause

      setStep("fixing");
      setProgress(55);

      const response = await fetch("/api/ai/fix-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full_resume",
          resumeJson: content as unknown as Record<string, unknown>,
          resumeText,
          jobDescription: jd,
          missingKeywords,
          currentScore: score,
          locale: "en",
        }),
      });

      setProgress(85);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error(err.message || "Daily fix limit reached. Upgrade for more.", {
            style: { background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#fca5a5" },
          });
          setStep("idle");
          return;
        }
        throw new Error("Fix all failed");
      }

      const data: ResumeFixResult = await response.json();
      setFixes(data);
      setPendingFixes(data);
      setProgress(100);
      setStep("review");
    } catch (err) {
      console.error("[FixAllBanner] error:", err);
      toast.error("AI couldn't fix the resume right now. Try again.");
      setStep("idle");
      setProgress(0);
    }
  };

  const handleApplyAll = () => {
    if (!fixes) return;
    setStep("applying");
    // Give the UI a frame to update before the potentially heavy state mutation
    setTimeout(() => {
      applyAllFixes(fixes);
      setFixes(null);
      setStep("done");
      toast.success(
        `${fixes.changes_count || "All"} improvements applied! Estimated score: ${fixes.estimated_new_score}/100`,
        {
          duration: 5000,
          style: {
            background: "rgba(5, 150, 105, 0.1)",
            border: "1px solid rgba(5, 150, 105, 0.3)",
            color: "#34d399",
            fontWeight: "700",
            fontSize: "12px",
          },
        }
      );
      // Auto-dismiss after success
      setTimeout(() => setDismissed(true), 3000);
    }, 50);
  };

  const isProcessing = ["fetching_jd", "analyzing", "fixing", "applying"].includes(step);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="fix-all-banner"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4",
            className
          )}
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#0d0d12] border border-violet-500/25 shadow-[0_8px_48px_rgba(124,58,237,0.18)]">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/8 via-transparent to-violet-600/8 pointer-events-none" />

            {/* Progress bar */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  key="progress-bar"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500"
                />
              )}
            </AnimatePresence>

            <div className="relative px-6 py-4 flex items-center gap-4">
              {/* Left: Icon + text */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-500",
                  step === "done"
                    ? "bg-emerald-600/15 border-emerald-500/30"
                    : "bg-violet-600/15 border-violet-500/25"
                )}>
                  {step === "done" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : isProcessing ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 text-violet-400" />
                  )}
                </div>

                <div className="min-w-0">
                  {step === "idle" && (
                    <>
                      <p className="text-sm font-black text-white leading-tight">
                        Your resume has fixable issues
                      </p>
                      <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-0.5">
                        Score {score}/100 — AI can fix this in one click
                      </p>
                    </>
                  )}

                  {step === "review" && fixes && (
                    <>
                      <p className="text-sm font-black text-white leading-tight">
                        {fixes.changes_count} improvements ready to apply
                      </p>
                      <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-0.5">
                        Estimated new score: {fixes.estimated_new_score}/100
                        {" "}(+{fixes.estimated_new_score - score} pts)
                      </p>
                    </>
                  )}

                  {step === "done" && (
                    <>
                      <p className="text-sm font-black text-emerald-400 leading-tight">
                        All fixes applied!
                      </p>
                      <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-0.5">
                        Re-run the ATS audit to see your new score
                      </p>
                    </>
                  )}

                  {isProcessing && (
                    <p className="text-sm font-black text-white/70 leading-tight animate-pulse">
                      {STEP_LABELS[step]}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {step === "idle" && (
                  <Button
                    id="fix-all-resume-btn"
                    onClick={handleFixAll}
                    className="h-9 px-5 bg-violet-600 hover:bg-violet-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/25 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 mr-2" />
                    Fix All Issues
                    <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}

                {step === "review" && (
                  <Button
                    id="apply-all-fixes-btn"
                    onClick={handleApplyAll}
                    className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Apply All
                  </Button>
                )}

                {/* Dismiss */}
                {!isProcessing && step !== "done" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDismissed(true)}
                    className="w-8 h-8 text-white/20 hover:text-white hover:bg-white/5 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Missing keywords row — shown in idle state */}
            {step === "idle" && missingKeywords.length > 0 && (
              <div className="px-6 pb-4 flex items-center gap-2 flex-wrap">
                <AlertTriangle className="w-3 h-3 text-amber-500/70 flex-shrink-0" />
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                  Missing:
                </p>
                {missingKeywords.slice(0, 5).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-md bg-amber-500/8 border border-amber-500/15 text-[9px] font-bold text-amber-500/60 uppercase tracking-wider"
                  >
                    {kw}
                  </span>
                ))}
                {missingKeywords.length > 5 && (
                  <span className="text-[9px] text-white/15 font-bold">
                    +{missingKeywords.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
