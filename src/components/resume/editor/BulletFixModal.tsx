"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Check, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export interface BulletFixPayload {
  expId: string;
  bulletIdx: number;
  original: string;
  rewritten: string;
  improvement: string;
}

interface BulletFixModalProps {
  payload: BulletFixPayload | null;
  onClose: () => void;
}

export function BulletFixModal({ payload, onClose }: BulletFixModalProps) {
  const { applyBulletFix } = useResumeStore();
  const [accepted, setAccepted] = React.useState(false);

  // Reset accepted state whenever the payload changes (new bullet being fixed)
  React.useEffect(() => {
    setAccepted(false);
  }, [payload?.original]);

  const handleAccept = () => {
    if (!payload) return;
    applyBulletFix(payload.expId, payload.bulletIdx, payload.rewritten);
    setAccepted(true);
    toast.success("Bullet upgraded ✦", {
      style: {
        background: "rgba(124, 58, 237, 0.12)",
        border: "1px solid rgba(124, 58, 237, 0.3)",
        color: "#a78bfa",
        fontWeight: "700",
        fontSize: "12px",
        letterSpacing: "0.05em",
      },
    });
    setTimeout(onClose, 600);
  };

  const handleDismiss = () => {
    onClose();
  };

  // Highlight words added in the rewritten version vs original
  const highlightNewWords = (original: string, rewritten: string) => {
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    return rewritten.split(/\s+/).map((word, i) => {
      const isNew = !originalWords.has(word.toLowerCase().replace(/[^a-z0-9]/g, ""));
      return (
        <span
          key={i}
          className={cn(
            "transition-colors",
            isNew ? "text-emerald-400 font-semibold" : "text-white/90"
          )}
        >
          {word}{" "}
        </span>
      );
    });
  };

  return (
    <AnimatePresence mode="wait">
      {payload && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleDismiss}
          />

          {/* Modal Panel — slides in from right */}
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col bg-[#0a0a0f] border-l border-white/8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                    AI Fix Preview
                  </p>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                    Review before applying
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="w-8 h-8 text-white/20 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-8 py-8 space-y-6">

              {/* Before */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Before</p>
                </div>
                <div className="relative p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/3 to-transparent pointer-events-none" />
                  <p className="text-sm text-white/50 leading-relaxed line-through decoration-red-500/40">
                    {payload.original || <span className="italic text-white/20">Empty bullet</span>}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-violet-500/40" />
                  <div className="w-8 h-8 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-500/40" />
                </div>
              </div>

              {/* After */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">After</p>
                </div>
                <div className="relative p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/4 to-transparent pointer-events-none" />
                  <p className="text-sm leading-relaxed">
                    {highlightNewWords(payload.original, payload.rewritten)}
                  </p>
                  {/* Glow pulse on new content */}
                  <motion.div
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-px rounded-2xl border border-emerald-500/30 pointer-events-none"
                  />
                </div>
              </div>

              {/* Improvement reason */}
              {payload.improvement && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">
                    What changed
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {payload.improvement}
                  </p>
                </div>
              )}

              {/* Tip: green words are new */}
              <p className="text-[9px] text-white/15 text-center font-bold uppercase tracking-widest">
                ✦ Green words are newly added or strengthened
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 border-t border-white/5 flex gap-3">
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="flex-1 h-11 border border-white/8 bg-white/3 text-white/40 hover:text-white hover:border-white/15 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all"
              >
                Dismiss
              </Button>
              <Button
                onClick={handleAccept}
                disabled={accepted}
                id="bullet-fix-accept-btn"
                className={cn(
                  "flex-1 h-11 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all duration-300",
                  accepted
                    ? "bg-emerald-600/80 text-white"
                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
                )}
              >
                {accepted ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Applied
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Accept Fix
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
