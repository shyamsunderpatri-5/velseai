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
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: "210/297", transform: "scale(1)", transformOrigin: "top left" }}>
        <TemplateComponent content={content} settings={settings} />
      </div>
    </div>
  );
}
