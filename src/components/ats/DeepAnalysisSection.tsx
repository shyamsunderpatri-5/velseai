"use client";

import * as React from "react";
import { AlertTriangle, Sparkles, Download, Loader2 as Spinner } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissingIntelligenceTable } from "./MissingIntelligenceTable";
import { FixGuideTable } from "./FixGuideTable";
import { ActiveCommandPanel } from "./ActiveCommandPanel";

import { toast } from "react-hot-toast";

interface DeepAnalysisSectionProps {
  result: any;
  fixResult: any | null;
  onGenerateProtocol: () => void;
  isGenerating: boolean;
  lastData: any;
}

export function DeepAnalysisSection({ 
  result, 
  fixResult, 
  onGenerateProtocol,
  isGenerating,
  lastData
}: DeepAnalysisSectionProps) {
  const handleDownloadPDF = async () => {
    const companyName = lastData?.companyName || "Target";
    try {
      toast.loading("Generating Premium Asset...", { id: "pdf" });
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          html: result.summary || result.mismatch_message || "Portfolio Protocol",
          filename: `Selvo-${companyName}-Strategy.pdf`
        })
      });

      if (!response.ok) throw new Error("PDF generation failed.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Selvo-${companyName}-Strategy.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Premium Asset Downloaded", { id: "pdf" });
    } catch (error) {
      toast.error("Failed to generate PDF asset.", { id: "pdf" });
    }
  };

  return (
    <div className="space-y-12 py-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Action Header: Primary CTA + Single Download */}
      {!fixResult && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {result.overall_score < 80 ? (
            <Button 
              onClick={() => window.location.href = '/resume-builder'}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-[1.5rem] gap-3 font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-emerald-600/30 transition-transform hover:scale-[1.01]"
            >
              🚀 Build Optimized Resume (Auto-Fix)
            </Button>
          ) : (
            <Button 
              onClick={onGenerateProtocol}
              disabled={isGenerating}
              className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white h-14 rounded-[1.5rem] gap-3 font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-violet-600/30 transition-transform hover:scale-[1.01]"
            >
              {isGenerating ? <Spinner className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 font-bold" />}
              {isGenerating ? "Synthesizing Protocol..." : "Generate Optimization Protocol"}
            </Button>
          )}

          <Button 
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white hover:text-black text-white h-14 rounded-[1.5rem] gap-3 font-black uppercase text-[11px] tracking-widest transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>
      )}

      {/* Deep Analysis Table */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Deep Analysis Protocol
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-9">
              Institutional-grade gap detection and logic audit
            </p>
          </div>
        </div>
        
        <MissingIntelligenceTable 
          missingKeywords={result.missing_keywords}
          missingSkills={result.hard_skills_missing || []}
          keywordFrames={result.keyword_frames}
          suggestions={result.suggestions}
          atsIssues={result.ats_issues}
        />
      </div>

      {/* Optimization Synthesizer (Fixes) */}
      {fixResult && (
        <div className="space-y-8 pt-12 border-t border-white/5">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-violet-400" />
              Optimization Synthesizer
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-9">
              AI-generated content upgrades for maximum impact
            </p>
          </div>

          <FixGuideTable 
            improvedSummary={fixResult.improved_summary}
            sections={fixResult.sections}
          />
        </div>
      )}

      {/* Active Command Hub (New) */}
      <ActiveCommandPanel 
        jobTitle={lastData?.jobTitle || "Professional"}
        companyName={lastData?.companyName || "Target Company"}
        overallScore={result.overall_score}
      />
    </div>
  );
}
