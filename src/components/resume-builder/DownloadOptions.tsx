"use client";

import { useState } from "react";
import { generatePdfFromHtml } from "@/lib/pdf/generator";
import { Download, Lock, FileText, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DownloadOptionsProps {
  isPro: boolean;
  hasResume: boolean;
  hasCoverLetter: boolean;
  onGenerateCoverLetter: () => void;
  candidateName: string;
  resumeData?: any;
  templateId?: string;
}

export function DownloadOptions({ isPro, hasResume, hasCoverLetter, onGenerateCoverLetter, candidateName, resumeData, templateId }: DownloadOptionsProps) {
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [downloadingCl, setDownloadingCl] = useState(false);

  const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, "_") || "Applicant";

  const handleDownloadResume = async () => {
    if (!isPro) return;
    setDownloadingResume(true);
    try {
      await generatePdfFromHtml(resumeData, `${safeName}_Optimized_Resume`, templateId);
    } catch (e) {
      console.error(e);
      alert("Failed to build PDF. Please try again.");
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleDownloadCL = async () => {
    if (!isPro) return;
    setDownloadingCl(true);
    try {
      await generatePdfFromHtml("cover-letter-pdf-container", `${safeName}_Cover_Letter`);
    } catch (e) {
      console.error(e);
      alert("Failed to build PDF. Please try again.");
    } finally {
      setDownloadingCl(false);
    }
  };

  return (
    <div className="bg-[#0C0C0E] border border-[#1F1F23] rounded-2xl p-6 space-y-6">
      
      {!isPro && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-amber-500 font-bold text-sm">PRO FEATURE</h4>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              Downloading unlocked ATS-compliant PDFs requires the $9 Sprint Pass. Upgrade to extract limitless value from your career campaign.
            </p>
            <Link href="/pricing" className="mt-3 inline-block px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resume Button */}
        <button
          onClick={handleDownloadResume}
          disabled={!hasResume || (!isPro && true) || downloadingResume}
          className={cn(
            "p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300",
            !isPro 
              ? "opacity-50 cursor-not-allowed border-[#1F1F23] bg-zinc-900/50" 
              : "border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 hover:border-violet-500 cursor-pointer text-white"
          )}
        >
          {downloadingResume ? (
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText className={cn("w-6 h-6", isPro ? "text-violet-400" : "text-zinc-500")} />
          )}
          <div className="text-center">
            <div className="text-sm font-bold">{downloadingResume ? "Encoding PDF..." : "Download Resume"}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">High-Fidelity PDF</div>
          </div>
        </button>

        {/* Cover Letter Button */}
        {hasCoverLetter ? (
          <button
            onClick={handleDownloadCL}
            disabled={(!isPro && true) || downloadingCl}
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300",
              !isPro 
                ? "opacity-50 cursor-not-allowed border-[#1F1F23] bg-zinc-900/50" 
                : "border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 hover:border-blue-500 cursor-pointer text-white"
            )}
          >
            {downloadingCl ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileIcon className={cn("w-6 h-6", isPro ? "text-blue-400" : "text-zinc-500")} />
            )}
            <div className="text-center">
              <div className="text-sm font-bold">{downloadingCl ? "Encoding PDF..." : "Download Cover Letter"}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">High-Fidelity PDF</div>
            </div>
          </button>
        ) : (
          <button
            onClick={onGenerateCoverLetter}
            disabled={!hasResume}
            className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">Generate Cover Letter</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">AI Powered</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
