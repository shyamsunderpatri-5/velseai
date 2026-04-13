"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

interface GermanPersonal {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  // German-specific fields
  birthDate?: string;
  nationality?: string;
  maritalStatus?: string;
  photo?: string;
  postalCode?: string;
  street?: string;
}

export function LebenslaufTemplate({ content, settings }: TemplateProps) {
  const personal = (content.personal as GermanPersonal) || {};
  const experience = content.experience || [];
  const education = content.education || [];
  const skills = (content.skills as Array<{ skills: string[] }>).map(s => s.skills).flat() || [];
  const projects = content.projects || [];
  const certifications = content.certifications || [];
  const languages = content.languages || [];
  const achievements = content.achievements?.map(a => a.title) || [];

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

  const formatDateGerman = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
  };

  return (
    <div className="p-8 bg-white text-gray-900 font-body" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header with Photo - German format */}
      <div className="flex items-start justify-between mb-6 border-b-2 border-gray-800 pb-4">
        <div className="flex-1">
          <h1 className={cn("font-heading font-bold text-2xl text-gray-900", fontSizes.heading)}>
            {personal.fullName || "Ihr Name"}
          </h1>
          
          {/* Personal Details - German style */}
          <div className={cn("text-gray-600 mt-2", fontSizes.name)}>
            {personal.street && personal.postalCode && (
              <p>{personal.street}, {personal.postalCode} {personal.location}</p>
            )}
            {personal.phone && <p>Tel.: {personal.phone}</p>}
            {personal.email && <p>E-Mail: {personal.email}</p>}
            {personal.birthDate && <p>Geburtsdatum: {personal.birthDate}</p>}
            {personal.nationality && <p>Nationalität: {personal.nationality}</p>}
            {personal.maritalStatus && <p>Familienstand: {personal.maritalStatus}</p>}
          </div>
        </div>
        
        {/* Photo - top right for German CVs */}
        {personal.photo && (
          <div className="ml-4 w-24 h-24 flex-shrink-0">
            <img 
              src={personal.photo} 
              alt="Profilfoto" 
              className="w-full h-full object-cover rounded-sm"
            />
          </div>
        )}
      </div>

      {/* Summary / Profil */}
      {personal.summary && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Profil
          </h2>
          <p className={cn("text-gray-700 leading-relaxed", fontSizes.name)}>{personal.summary}</p>
        </div>
      )}

      {/* Work Experience - German order: most recent first */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Berufserfahrung
          </h2>
          <div className={spacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{exp.role}</h3>
                    <p className="text-gray-600 text-xs">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDateGerman(exp.startDate)} — {exp.isCurrent ? "heute" : formatDateGerman(exp.endDate)}
                  </p>
                </div>
                {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className={cn("text-gray-700 mt-1", fontSizes.name)}>• {bullet}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education - German format */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Ausbildung / Studium
          </h2>
          <div className={spacing}>
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                    </h3>
                    <p className="text-gray-600 text-xs">{edu.institution}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {edu.startDate ? `${formatDateGerman(edu.startDate)} - ${formatDateGerman(edu.endDate)}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Fachkenntnisse
          </h2>
          <p className={cn("text-gray-700", fontSizes.name)}>
            {skills.join(", ")}
          </p>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Sprachkenntnisse
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang, i) => (
              <p key={i} className={cn("text-gray-700", fontSizes.name)}>
                {typeof lang === 'string' ? lang : `${lang.language} (${lang.proficiency || 'Grundkenntnisse'})`}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Projekte
          </h2>
          <div className={spacing}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{proj.name}</h3>
                {proj.description && (
                  <p className={cn("text-gray-700", fontSizes.name)}>{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Zertifizierungen
          </h2>
          <div className={spacing}>
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{cert.name}</h3>
                  <p className="text-gray-600 text-xs">{cert.issuer}</p>
                </div>
                {cert.issueDate && <p className="text-xs text-gray-500">{cert.issueDate}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests / Hobbies */}
      {achievements && achievements.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase text-sm tracking-wide", fontSizes.heading)}>
            Interessen
          </h2>
          <p className={cn("text-gray-700", fontSizes.name)}>
            {achievements.join(", ")}
          </p>
        </div>
      )}

      {/* References - German CVs often include this */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <p className={cn("text-gray-500 text-xs italic", fontSizes.name)}>
          Referenzen werden auf Anfrage gerne angegeben.
        </p>
      </div>
    </div>
  );
}