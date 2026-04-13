"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Target, FileText, Briefcase, Calendar, Sparkles } from "lucide-react";

interface SubScore {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface ATSScoreCardProps {
  score: number;
  subScores: SubScore[];
  className?: string;
}

export function ATSScoreCard({ score, subScores, className }: ATSScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 86) return "bg-success";
    if (value >= 71) return "bg-blue-500";
    if (value >= 41) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Overall ATS Score
          </span>
          <Badge
            variant={
              score >= 86
                ? "success"
                : score >= 71
                ? "default"
                : score >= 41
                ? "warning"
                : "destructive"
            }
          >
            {score >= 86 ? "ATS Optimized" : "Needs Improvement"}
          </Badge>
        </div>
        <div className="relative">
          <Progress
            value={score}
            className="h-4"
            indicatorClassName={getScoreColor(score)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {subScores.map((sub) => (
          <div
            key={sub.label}
            className="p-4 rounded-lg border bg-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{sub.icon}</span>
                <span className="text-sm font-medium">{sub.label}</span>
              </div>
              <span className="text-lg font-bold tabular-nums">{sub.value}%</span>
            </div>
            <Progress
              value={sub.value}
              className="h-2"
              indicatorClassName={getScoreColor(sub.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const DEFAULT_SUBSCORES: SubScore[] = [
  {
    label: "Keyword Match",
    value: 0,
    icon: <Target className="w-4 h-4" />,
  },
  {
    label: "Format Score",
    value: 0,
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Skills Match",
    value: 0,
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: "Experience Match",
    value: 0,
    icon: <Briefcase className="w-4 h-4" />,
  },
];
