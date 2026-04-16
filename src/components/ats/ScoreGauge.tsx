"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLabel?: boolean;
}

export function ScoreGauge({
  score,
  size = "md",
  className,
  showLabel = true,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const sizeClasses = {
    sm: { outer: 80, stroke: 6, fontSize: "text-lg", labelSize: "text-[8px]" },
    md: { outer: 140, stroke: 10, fontSize: "text-3xl", labelSize: "text-[10px]" },
    lg: { outer: 200, stroke: 14, fontSize: "text-5xl", labelSize: "text-xs" },
    xl: { outer: 280, stroke: 20, fontSize: "text-7xl", labelSize: "text-sm" },
  };

  const { outer, stroke, fontSize, labelSize } = sizeClasses[size];
  const radius = (outer - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const getScoreColor = (s: number) => {
    if (s >= 85) return "from-emerald-400 to-cyan-500 shadow-emerald-500/50";
    if (s >= 70) return "from-violet-500 to-fuchsia-500 shadow-violet-500/50";
    if (s >= 40) return "from-amber-400 to-orange-500 shadow-amber-500/50";
    return "from-red-500 to-rose-600 shadow-red-500/50";
  };

  const getStatusText = (s: number) => {
    if (s >= 85) return "ELITE";
    if (s >= 70) return "OPTIMIZED";
    if (s >= 40) return "VULNERABLE";
    return "CRITICAL";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center group", className)}>
      {/* 3D Glassmorphic Glow */}
      <div className={cn(
        "absolute inset-0 blur-[30px] opacity-20 transition-all duration-1000",
        score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-violet-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
      )} />

      <svg
        width={outer}
        height={outer}
        viewBox={`0 0 ${outer} ${outer}`}
        className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <linearGradient id={`gaugeGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {score >= 85 ? (
              <>
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </>
            ) : score >= 70 ? (
              <>
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </>
            ) : score >= 40 ? (
              <>
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f97316" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </>
            )}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Background Track */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* Main Progress Ring */}
        <motion.circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={`url(#gaugeGradient-${score})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (animatedScore / 100) * circumference }}
          transition={{ duration: 2, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: "url(#glow)" }}
        />

        {/* Decorative Inner Track */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius - stroke}
          fill="none"
          stroke="rgba(255,255,255,0.01)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
      </svg>

      {/* Center Display */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="relative">
          <motion.span 
            className={cn("font-black text-white tabular-nums tracking-tighter block", fontSize)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {Math.round(animatedScore)}
          </motion.span>
          <div className="h-px w-8 mx-auto bg-white/10 my-1 group-hover:w-12 transition-all duration-500" />
        </div>
        
        {showLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={cn("font-black uppercase tracking-[0.3em] overflow-hidden", labelSize)}
          >
            <span className={cn(
              "bg-clip-text text-transparent bg-gradient-to-r",
              score >= 85 ? "from-emerald-400 to-cyan-400" : 
              score >= 70 ? "from-violet-400 to-fuchsia-400" : 
              score >= 40 ? "from-amber-400 to-orange-400" : 
              "from-red-400 to-rose-400"
            )}>
              {getStatusText(animatedScore)}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

