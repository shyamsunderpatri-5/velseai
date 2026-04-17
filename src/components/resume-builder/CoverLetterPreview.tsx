"use client";

import { GeneratedCoverLetter } from "@/lib/resume-builder/cover-letter";

interface CoverLetterPreviewProps {
  data: GeneratedCoverLetter;
}

export function CoverLetterPreview({ data }: CoverLetterPreviewProps) {
  return (
    <div className="w-full flex justify-center bg-black/40 rounded-xl p-4 overflow-x-auto relative">
      {/* 1. VISUAL PREVIEW: Scaled for the UI */}
      <div 
        className="bg-white text-black p-12 shadow-2xl shadow-black/50 origin-top transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 transition-transform"
        style={{
          width: "794px",
          minHeight: "1123px",
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "14px",
          lineHeight: "1.6"
        }}
      >
        <CoverLetterContent data={data} />
      </div>

      {/* 2. PHANTOM CAPTURE LAYER: Hidden 1:1 scale for PDF generator */}
      <div 
        id="cover-letter-pdf-container"
        className="absolute top-0 left-[-9999px] pointer-events-none bg-white text-black p-12"
        style={{
          width: "794px",
          minHeight: "1123px",
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "14px",
          lineHeight: "1.6"
        }}
      >
        <CoverLetterContent data={data} />
      </div>
    </div>
  );
}

// Sub-component to avoid duplicating the layout logic
function CoverLetterContent({ data }: { data: GeneratedCoverLetter }) {
  return (
    <>
      <div className="mb-10 text-center border-b border-black pb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">{data.header.applicantName}</h1>
        <div className="text-xs mt-1">
          {data.header.applicantEmail} • {data.header.applicantPhone}
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-4">{data.header.date}</p>
        <p className="font-bold">{data.recipient.hiringManagerName}</p>
        <p>{data.recipient.jobTitle}</p>
        <p>{data.recipient.companyName}</p>
      </div>

      <div className="space-y-4 text-justify">
        <p>{data.body.openingParagraph}</p>
        <p>{data.body.bodyParagraph1}</p>
        <p>{data.body.bodyParagraph2}</p>
        <p>{data.body.bodyParagraph3}</p>
        <p>{data.body.closingParagraph}</p>
      </div>

      <div className="mt-12">
        <p>Sincerely,</p>
        <div className="mt-4 mb-2 text-3xl font-bold italic opacity-80" style={{ fontFamily: "Georgia, serif" }}>
          {data.signature}
        </div>
        <p className="font-bold">{data.header.applicantName}</p>
      </div>
    </>
  );
}
