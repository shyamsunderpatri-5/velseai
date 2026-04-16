"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { TechTemplate } from "./templates/TechTemplate";

interface ResumePreviewProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

export function ResumePreview({ content, settings }: ResumePreviewProps) {
  const templateComponents: Record<string, React.ComponentType<{ content: ResumeContent; settings: ResumeSettings }>> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    minimal: MinimalTemplate,
    tech: TechTemplate,
  };

  const TemplateComponent = templateComponents[settings.templateId] || ModernTemplate;

  return (
    <div 
      className="bg-white text-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.4)]" 
      style={{ 
        width: "210mm", 
        minHeight: "297mm", 
        backgroundColor: "white" 
      }}
    >
      <TemplateComponent content={content} settings={settings} />
    </div>
  );
}

