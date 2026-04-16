"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Check,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface MissingKeyword {
  keyword: string;
  category: string;
  count: number;
}

interface KeywordsHighlighterProps {
  jobDescription?: string;
  resumeContent?: any;
  onAddKeyword?: (keyword: string) => void;
  className?: string;
}

export function KeywordsHighlighter({
  jobDescription,
  resumeContent,
  onAddKeyword,
  className
}: KeywordsHighlighterProps) {
  const [keywords, setKeywords] = React.useState<MissingKeyword[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);

  React.useEffect(() => {
    if (jobDescription) {
      analyzeKeywords();
    }
  }, [jobDescription, resumeContent]);

  const analyzeKeywords = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/extract-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume: resumeContent,
        }),
      });
      
      const data = await response.json();
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error("Keyword analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const extractText = (content: any): string => {
    if (!content) return "";
    if (typeof content === "string") return content;
    
    let text = "";
    if (content.personal?.fullName) text += content.personal.fullName + " ";
    if (content.personal?.summary) text += content.personal.summary + " ";
    if (content.experience) {
      content.experience.forEach((exp: any) => {
        text += (exp.role || "") + " " + (exp.company || "") + " ";
        if (exp.bulletPoints) text += exp.bulletPoints.join(" ") + " ";
      });
    }
    if (content.skills) {
      Object.values(content.skills).forEach((skills: any) => {
        if (Array.isArray(skills)) text += skills.join(" ") + " ";
      });
    }
    return text;
  };

  const findMissing = () => {
    if (!resumeContent || !jobDescription) return [];
    
    const resumeText = extractText(resumeContent).toLowerCase();
    const jdText = jobDescription.toLowerCase();
    
    // Common job keywords to check
    const commonKeywords = [
      "leadership", "team", "management", "strategy", "analytics",
      "python", "java", "javascript", "sql", "aws", "docker", "kubernetes",
      "agile", "scrum", "ci/cd", "devops", "cloud", "api", "microservices",
      "machine learning", "ai", "data", "python", "react", "node",
      "communication", "presentation", "problem-solving", "collaboration"
    ];

    return commonKeywords
      .filter(kw => jdText.includes(kw) && !resumeText.includes(kw))
      .slice(0, 10)
      .map(kw => ({
        keyword: kw,
        category: categorizeKeyword(kw),
        count: 1,
      }));
  };

  const categorizeKeyword = (keyword: string): string => {
    const tech = ["python", "java", "javascript", "sql", "aws", "docker", "kubernetes", "api", "react", "node"];
    const soft = ["leadership", "communication", "collaboration", "problem-solving"];
    const process = ["agile", "scrum", "ci/cd", "devops"];
    
    if (tech.includes(keyword)) return "Technical";
    if (soft.includes(keyword)) return "Soft Skills";
    if (process.includes(keyword)) return "Process";
    return "General";
  };

  const displayKeywords = keywords.length > 0 ? keywords : findMissing();
  const matchedCount = displayKeywords.filter(k => {
    const resumeText = extractText(resumeContent).toLowerCase();
    return resumeText.includes(k.keyword);
  }).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-purple-400" />
          <span className="font-medium text-white text-sm">Keywords</span>
        </div>
        <Badge variant="outline" className="text-xs border-white/10 text-zinc-400">
          {matchedCount}/{displayKeywords.length} matched
        </Badge>
      </div>

      {analyzing ? (
        <div className="text-center py-4 text-zinc-500 text-sm">
          Analyzing keywords...
        </div>
      ) : displayKeywords.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">
            Add these missing keywords from the job description:
          </p>
          <div className="flex flex-wrap gap-2">
            {displayKeywords.map((kw, idx) => {
              const resumeText = extractText(resumeContent).toLowerCase();
              const isMatched = resumeText.includes(kw.keyword);
              
              return (
                <button
                  key={idx}
                  onClick={() => !isMatched && onAddKeyword?.(kw.keyword)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isMatched 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20"
                  )}
                >
                  {isMatched ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  {kw.keyword}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm text-zinc-400">All key keywords found!</p>
        </div>
      )}

      {displayKeywords.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 border-white/10 text-zinc-400 hover:text-white"
          onClick={analyzeKeywords}
        >
          <Sparkles className="w-3 h-3 mr-2" />
          Re-analyze Keywords
        </Button>
      )}
    </div>
  );
}