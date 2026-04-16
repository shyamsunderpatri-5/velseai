"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function WizardStep({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  isNextDisabled = false,
  isNextLoading = false,
  nextLabel = "Continue",
  showBack = true,
  stepNumber,
  totalSteps,
}: WizardStepProps) {
  const progress = (stepNumber / totalSteps) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full max-w-md mx-auto w-full"
    >
      {/* Step Progress Top */}
      <div className="px-6 pt-8 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
              <span className="text-[10px] font-black text-violet-500">{stepNumber}</span>
            </div>
            <div className="h-4 w-px bg-white/5" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>
          {stepNumber === 3 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">AI Synthesis</span>
            </div>
          )}
        </div>
        
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
          />
        </div>
      </div>

      {/* Content Header */}
      <div className="px-6 pb-8 space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.15em] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 pb-32 overflow-y-auto custom-scrollbar">
        {children}
      </div>

      {/* Persistent Bottom Actions (Mobile Optimized) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050506] via-[#050506] to-transparent pt-12 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          {showBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="h-14 w-14 p-0 border-white/5 bg-white/5 text-white/40 hover:text-white rounded-2xl group transition-all"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={isNextDisabled || isNextLoading}
            className={cn(
              "flex-1 h-14 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl",
              isNextDisabled 
                ? "bg-white/5 text-white/10 border border-white/5" 
                : "bg-white text-black hover:bg-violet-600 hover:text-white shadow-violet-600/10"
            )}
          >
            {isNextLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {nextLabel}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </div>
        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-4">
          Protocol: Data Persisted Locally • End-to-End Encryption
        </p>
      </div>
    </motion.div>
  );
}
