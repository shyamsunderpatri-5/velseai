"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

interface ArabicPersonal {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  // Arabic-specific fields
  nationality?: string;
  passportNumber?: string;
}

export function ArabicTemplate({ content, settings }: TemplateProps) {
  const personal = (content.personal as ArabicPersonal) || {};
  const { experience, education, skills, projects, certifications, languages, achievements } = content;

  const fontSizeMap = {
    small: { name: "text-xs", heading: "text-sm" },
    medium: { name: "text-sm", heading: "text-base" },
    large: { name: "text-base", heading: "text-lg" },
  };

  const spacingMap = {
    compact: "space-y-2",
    normal: "space-y-3",
    spacious: "space-y-4",
  };

  const fontSizes = fontSizeMap[settings.fontSize];
  const spacing = spacingMap[settings.spacing];

  // Format date in Arabic format (DD/MM/YYYY)
  const formatDateArabic = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div className="p-8 bg-white text-gray-900 font-body" style={{ fontFamily: "'Noto Sans Arabic', 'Tahoma', sans-serif" }} dir="rtl">
      {/* Header - Arabic style: right aligned */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className={cn("font-heading font-bold text-2xl text-gray-900 text-right", fontSizes.heading)}>
          {personal.fullName || "الاسم الكامل"}
        </h1>
        
        {/* Contact Info - right aligned */}
        <div className={cn("text-gray-600 mt-2 text-right", fontSizes.name)}>
          {personal.location && <p>{personal.location}</p>}
          {personal.phone && <p>📞 {personal.phone}</p>}
          {personal.email && <p>✉️ {personal.email}</p>}
          {personal.linkedin && <p>🔗 {personal.linkedin}</p>}
          {personal.nationality && <p>🏢 {personal.nationality}</p>}
        </div>
      </div>

      {/* Summary / الملخص */}
      {personal.summary && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            الملخص المهني
          </h2>
          <p className={cn("text-gray-700 leading-relaxed text-right", fontSizes.name)}>
            {personal.summary}
          </p>
        </div>
      )}

      {/* Experience / الخبرة العملية - reversed for Arabic */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            الخبرة العملية
          </h2>
          <div className={spacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-row-reverse justify-between items-start">
                  <div className="text-right">
                    <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{exp.role}</h3>
                    <p className="text-gray-600 text-xs">{exp.company}{exp.location ? ` - ${exp.location}` : ""}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {exp.startDate ? formatDateArabic(exp.startDate) : ""} - {exp.isCurrent ? "حتى الآن" : (exp.endDate ? formatDateArabic(exp.endDate) : "")}
                  </p>
                </div>
                {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className={cn("text-gray-700 mt-1 text-right", fontSizes.name)}>• {bullet}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education / التعليم */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            التعليم
          </h2>
          <div className={spacing}>
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-row-reverse justify-between">
                <div className="text-right">
                  <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>
                    {edu.degree}{edu.field ? ` في ${edu.field}` : ""}
                  </h3>
                  <p className="text-gray-600 text-xs">{edu.institution}</p>
                </div>
                {(edu.startDate || edu.endDate) && (
                  <p className="text-xs text-gray-500">
                    {edu.startDate ? new Date(edu.startDate).getFullYear().toString() : ""}
                    {edu.endDate ? ` - ${new Date(edu.endDate).getFullYear().toString()}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills / المهارات */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            المهارات
          </h2>
          <p className={cn("text-gray-700 text-right", fontSizes.name)}>
            {skills.join(" - ")}
          </p>
        </div>
      )}

      {/* Languages / اللغات */}
      {languages && languages.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            اللغات
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <p key={lang.id} className={cn("text-gray-700 text-right", fontSizes.name)}>
                {lang.language} ({lang.proficiency || "متوسط"})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Projects / المشاريع */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            المشاريع
          </h2>
          <div className={spacing}>
            {projects.map((proj) => (
              <div key={proj.id} className="text-right">
                <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{proj.name}</h3>
                {proj.description && (
                  <p className={cn("text-gray-700", fontSizes.name)}>{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications / الشهادات */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            الشهادات والدورات
          </h2>
          <div className={spacing}>
            {certifications.map((cert) => (
              <div key={cert.id} className="flex flex-row-reverse justify-between">
                <div className="text-right">
                  <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{cert.name}</h3>
                  <p className="text-gray-600 text-xs">{cert.issuer}</p>
                </div>
                {cert.issueDate && <p className="text-xs text-gray-500">{new Date(cert.issueDate).getFullYear().toString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements / الإنجازات */}
      {achievements && achievements.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 text-right uppercase text-sm tracking-wide", fontSizes.heading)}>
            الإنجازات
          </h2>
          <ul className="list-disc list-right">
            {achievements.map((achievement) => (
              <li key={achievement.id} className={cn("text-gray-700 text-right", fontSizes.name)}>
                {achievement.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}