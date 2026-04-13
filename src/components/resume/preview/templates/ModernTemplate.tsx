"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

export function ModernTemplate({ content, settings }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages, achievements } = content;

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

  return (
    <div className="p-6 bg-white text-gray-900 font-body" style={{ fontFamily: settings.fontFamily }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className={cn("font-heading font-bold text-navy", fontSizes.heading)}>
            {personal.fullName || "Your Name"}
          </h1>
          <p className={cn("text-gray-600", fontSizes.name)}>
            Professional
          </p>
        </div>
        <div className="text-right text-xs text-gray-600">
          {personal.email && <p>{personal.email}</p>}
          {personal.phone && <p>{personal.phone}</p>}
          {personal.location && <p>{personal.location}</p>}
          {personal.linkedin && <p className="text-blue-600">{personal.linkedin}</p>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Professional Summary
          </h2>
          <p className={cn("text-gray-700", fontSizes.name)}>{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Work Experience
          </h2>
          <div className={spacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-semibold", fontSizes.name)}>{exp.role}</h3>
                    <p className="text-gray-600 text-xs">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                    {" - "}
                    {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className="text-xs text-gray-700 pl-3 mt-1">
                    • {bullet}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Education
          </h2>
          <div className={spacing}>
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-semibold", fontSizes.name)}>{edu.degree} in {edu.field}</h3>
                    <p className="text-gray-600 text-xs">{edu.institution}{edu.location ? `, ${edu.location}` : ""}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
                    {edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ""}
                    {edu.gpa ? ` | ${edu.gpa}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Skills
          </h2>
          <div className={spacing}>
            {skills.map((skill) => (
              <div key={skill.id} className="flex">
                <span className={cn("font-semibold text-navy w-32 flex-shrink-0", fontSizes.name)}>
                  {skill.category}:
                </span>
                <span className={cn("text-gray-700", fontSizes.name)}>
                  {skill.skills.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Projects
          </h2>
          <div className={spacing}>
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start">
                  <h3 className={cn("font-semibold", fontSizes.name)}>
                    {project.name}
                    {project.liveUrl && (
                      <a href={project.liveUrl} className="ml-2 text-blue-500 text-xs">🔗</a>
                    )}
                  </h3>
                  {project.technologies.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {project.technologies.join(", ")}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className={cn("text-gray-700", fontSizes.name)}>{project.description}</p>
                )}
                {project.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className="text-xs text-gray-700 pl-3">
                    • {bullet}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Certifications
          </h2>
          <div className={spacing}>
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className={cn("font-medium", fontSizes.name)}>{cert.name}</span>
                <span className="text-xs text-gray-500">{cert.issuer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <h2 className={cn("font-heading font-semibold text-navy border-b border-gray-200 pb-1 mb-2", fontSizes.heading)}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <span key={lang.id} className={cn("text-gray-700", fontSizes.name)}>
                {lang.language} - <span className="text-gray-500">{lang.proficiency}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
