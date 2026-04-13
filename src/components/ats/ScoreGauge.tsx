"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

export function ScoreGauge({
  score,
  size = "md",
  className,
  animate = true,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = React.useState(0);

  React.useEffect(() => {
    if (!animate) {
      setAnimatedScore(score);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animate]);

  const sizeClasses = {
    sm: { outer: 120, stroke: 8, fontSize: "text-2xl" },
    md: { outer: 180, stroke: 12, fontSize: "text-4xl" },
    lg: { outer: 240, stroke: 16, fontSize: "text-5xl" },
  };

  const { outer, stroke, fontSize } = sizeClasses[size];
  const radius = (outer - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 86) return "#0F9B58";
    if (s >= 71) return "#3b82f6";
    if (s >= 41) return "#F59E0B";
    return "#E94560";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 86) return "Excellent";
    if (s >= 71) return "Good";
    if (s >= 41) return "Fair";
    return "Poor";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={outer}
        height={outer}
        className="transform -rotate-90"
      >
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/20"
        />
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getScoreColor(score)}50)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn("font-heading font-bold", fontSize, "tabular-nums")}>
          {animatedScore}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          {getScoreLabel(animatedScore)}
        </span>
      </div>
    </div>
  );
}
