"use client";

import { ExtractedResume } from "@/lib/resume-builder/schemas";
import { TemplateId } from "./TemplateSelector";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";

interface ResumePreviewProps {
  data: ExtractedResume;
  templateId: TemplateId;
}

export function ResumePreview({ data, templateId }: ResumePreviewProps) {
  return (
    <div className="w-full flex justify-center bg-black/40 rounded-xl p-4 overflow-x-auto relative">
      {/* 1. SEAMLESS PREVIEW: 
          This is what the user sees. It uses CSS transforms to fit their screen.
      */}
      <div className="shadow-2xl shadow-black/50 origin-top transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 transition-transform">
        {templateId === "classic" && <ClassicTemplate data={data} />}
        {templateId === "modern" && <ModernTemplate data={data} />}
        {templateId === "minimal" && <MinimalTemplate data={data} />}
      </div>

      {/* 2. PHANTOM CAPTURE LAYER (CRITICAL):
          This is hidden off-screen. It is rendered at exactly 1:1 scale (no transforms).
          The PDF generator (html2canvas) targets THIS element specifically to ensure crystal clear, 
          pixel-perfect PDF generation without being affected by the user's zoom/scaling.
      */}
      <div 
        id="resume-pdf-container" 
        className="absolute top-0 left-[-9999px] pointer-events-none"
        style={{ width: "794px", height: "1123px" }}
      >
        {templateId === "classic" && <ClassicTemplate data={data} />}
        {templateId === "modern" && <ModernTemplate data={data} />}
        {templateId === "minimal" && <MinimalTemplate data={data} />}
      </div>
    </div>
  );
}
