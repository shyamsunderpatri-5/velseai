"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KeywordAnalysisProps {
  matchedKeywords: string[];
  missingKeywords: string[];
  hardSkillsMatched: string[];
  hardSkillsMissing: string[];
  className?: string;
}

export function KeywordAnalysis({
  matchedKeywords,
  missingKeywords,
  hardSkillsMatched,
  hardSkillsMissing,
  className,
}: KeywordAnalysisProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">Matched Keywords</h4>
          <Badge variant="success" className="text-xs">
            {matchedKeywords.length} found
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...new Set(matchedKeywords)].slice(0, 15).map((keyword) => (
            <Badge
              key={`match-${keyword}`}
              variant="success"
              className="text-xs font-normal"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">Missing Keywords</h4>
          <Badge variant="destructive" className="text-xs">
            {missingKeywords.length} missing
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...new Set(missingKeywords)].slice(0, 15).map((keyword) => (
            <Badge
              key={`missing-${keyword}`}
              variant="destructive"
              className="text-xs font-normal"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {hardSkillsMatched.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Hard Skills Matched</h4>
          <div className="flex flex-wrap gap-2">
            {[...new Set(hardSkillsMatched)].slice(0, 10).map((skill) => (
              <Badge key={`hard-${skill}`} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
