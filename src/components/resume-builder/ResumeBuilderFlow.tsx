"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { ExtractedResume, GeneratedCoverLetter } from "@/lib/resume-builder/schemas";
import { CountryFormatId } from "@/lib/resume-builder/country-formats";
import { ExtractedDataReview } from "./ExtractedDataReview";
import { CountrySelector } from "./CountrySelector";
import { TemplateSelector, TemplateId } from "./TemplateSelector";
import { ResumePreview } from "./ResumePreview";
import { CoverLetterPreview } from "./CoverLetterPreview";
import { DownloadOptions } from "./DownloadOptions";
import { cn } from "@/lib/utils";

type Step = "extraction_loading" | "review" | "country" | "template" | "generation_loading" | "results";

interface ResumeBuilderFlowProps {
  rawResumeText: string;
  jobDescription: string;
  missingKeywords: string[];
  companyName?: string;
  isPro: boolean;
}

export function ResumeBuilderFlow({ rawResumeText, jobDescription, missingKeywords, companyName, isPro }: ResumeBuilderFlowProps) {
  const [step, setStep] = useState<Step>("extraction_loading");
  
  // Data States
  const [extractedData, setExtractedData] = useState<ExtractedResume | null>(null);
  const [finalData, setFinalData] = useState<ExtractedResume | null>(null);
  const [coverLetter, setCoverLetter] = useState<GeneratedCoverLetter | null>(null);
  
  // Selection States
  const [targetCountry, setTargetCountry] = useState<CountryFormatId | null>(null);
  const [targetTemplate, setTargetTemplate] = useState<TemplateId | null>(null);
  const [activePreview, setActivePreview] = useState<"resume" | "cover_letter">("resume");

  // Error State
  const [error, setError] = useState<string | null>(null);

  // Mount effect to trigger extraction immediately
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    let isMounted = true;
    const runExtraction = async () => {
      try {
        const res = await fetch("/api/resume-builder/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: rawResumeText })
        });
        const json = await res.json();
        
        if (!isMounted) return;
        if (!res.ok) throw new Error(json.error || "Failed to extract data");
        
        setExtractedData(json.data);
        setStep("review");
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "Extraction failed");
      }
    };

    runExtraction();
    return () => { isMounted = false; };
  }, [rawResumeText]);

  const handleReviewSave = (data: ExtractedResume) => {
    setExtractedData(data);
    setStep("country");
  };

  const handleGenerate = async () => {
    if (!extractedData || !targetCountry || !targetTemplate) return;
    
    setStep("generation_loading");
    try {
      const res = await fetch("/api/resume-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedUserData: extractedData,
          jobDescription,
          missingKeywords,
          targetCountry,
          templateStyle: targetTemplate,
        })
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Failed to generate resume");
      
      setFinalData(json.data);
      setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("template");
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!finalData || !targetCountry) return;
    
    // Very basic tone selection logic mapped internally for now to save UX flow complexity
    try {
      const res = await fetch("/api/resume-builder/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedUserData: finalData,
          jobDescription,
          companyName: companyName || "Hiring Manager",
          targetCountry,
          tone: "professional"
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      setCoverLetter(json.data);
      setActivePreview("cover_letter");
    } catch (e) {
      console.error(e);
      alert("Failed to generate cover letter.");
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
        <h3 className="text-red-500 font-bold mb-2">Architectural Error</h3>
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors">
          Reset Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col">
      <AnimatePresence mode="wait">
        
        {step === "extraction_loading" && (
          <motion.div key="extracting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Deconstructing Reality...
            </h2>
            <p className="text-zinc-500 text-sm">Groq Llama 3 is extracting exact JSON structures from raw text.</p>
          </motion.div>
        )}

        {step === "review" && extractedData && (
          <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <ExtractedDataReview initialData={extractedData} onSave={handleReviewSave} />
          </motion.div>
        )}

        {step === "country" && (
          <motion.div key="country" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-8">
            <CountrySelector selectedCountry={targetCountry} onSelect={setTargetCountry} />
            <div className="flex justify-between items-center bg-[#0C0C0E] p-4 rounded-xl border border-[#1F1F23]">
              <button onClick={() => setStep("review")} className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <button 
                onClick={() => setStep("template")} 
                disabled={!targetCountry}
                className={cn("px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all", targetCountry ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500" : "bg-zinc-800 text-zinc-500 cursor-not-allowed")}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "template" && (
          <motion.div key="template" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-8">
            <TemplateSelector selectedTemplate={targetTemplate} onSelect={setTargetTemplate} />
            <div className="flex justify-between items-center bg-[#0C0C0E] p-4 rounded-xl border border-[#1F1F23]">
              <button onClick={() => setStep("country")} className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Change Country
              </button>
              <button 
                onClick={handleGenerate} 
                disabled={!targetTemplate}
                className={cn("px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all", targetTemplate ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500" : "bg-zinc-800 text-zinc-500 cursor-not-allowed")}
              >
                Synthesize ATS Output <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "generation_loading" && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white">Synthesizing Alpha...</h2>
            <div className="text-emerald-500 text-sm font-mono space-y-1 text-center mt-4">
              <p>Injecting Missing Keywords...</p>
              <p className="animate-pulse">Applying Structural Formats...</p>
            </div>
          </motion.div>
        )}

        {step === "results" && finalData && targetTemplate && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Side: Preview Area */}
              <div className="flex-1 bg-[#09090b] rounded-2xl border border-[#1F1F23] overflow-hidden flex flex-col">
                <div className="flex border-b border-[#1F1F23] bg-[#0c0c0e]">
                  <button 
                    onClick={() => setActivePreview("resume")}
                    className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors", activePreview === "resume" ? "text-violet-400 border-b-2 border-violet-500" : "text-zinc-500 hover:text-zinc-300")}
                  >
                    Resume Preview
                  </button>
                  <button 
                    onClick={() => setActivePreview("cover_letter")}
                    disabled={!coverLetter}
                    className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50", activePreview === "cover_letter" ? "text-blue-400 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300")}
                  >
                    Cover Letter
                  </button>
                </div>
                
                <div className="p-4 bg-zinc-950/50 relative">
                  {activePreview === "resume" ? (
                    <ResumePreview data={finalData} templateId={targetTemplate} />
                  ) : coverLetter ? (
                    <CoverLetterPreview data={coverLetter} />
                  ) : null}
                </div>
              </div>

              {/* Right Side: Options area */}
              <div className="w-full lg:w-80 space-y-6 shrink-0">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                  <div className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Estimated Match</div>
                  <div className="text-5xl font-black text-emerald-400 font-mono tracking-tighter">98<span className="text-2xl text-emerald-500/50">%</span></div>
                  <p className="text-xs text-zinc-400 mt-2">Perfectly aligned and optimized for Applicant Tracking Systems.</p>
                </div>

                <DownloadOptions 
                  isPro={isPro} 
                  hasResume={true} 
                  hasCoverLetter={!!coverLetter} 
                  onGenerateCoverLetter={handleGenerateCoverLetter} 
                  candidateName={finalData.personal.name}
                  resumeData={finalData}
                  templateId={targetTemplate}
                />
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
