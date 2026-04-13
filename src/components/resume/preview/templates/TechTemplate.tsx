"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

export function TechTemplate({ content, settings }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages } = content;
  const primaryColor = settings.primaryColor || "#1A1A2E";

  const fontSizeMap = {
    small: { name: "text-[11px]", heading: "text-xs" },
    medium: { name: "text-xs", heading: "text-sm" },
    large: { name: "text-sm", heading: "text-base" },
  };

  const spacingMap = {
    compact: "space-y-1",
    normal: "space-y-2",
    spacious: "space-y-3",
  };

  const fontSizes = fontSizeMap[settings.fontSize];
  const spacing = spacingMap[settings.spacing];

  const proficiencyLevels: Record<string, string> = {
    Native: "●●●●●",
    Fluent: "●●●●○",
    Professional: "●●●○○",
    Intermediate: "●●○○○",
    Basic: "●○○○○",
  };

  return (
    <div className="p-4 bg-white text-gray-900 font-mono" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" }}>
      {/* Header with GitHub-style accent */}
      <div className="border-b-4 mb-4 pb-3" style={{ borderColor: primaryColor }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn("font-bold text-lg", fontSizes.heading)} style={{ color: primaryColor }}>
              {personal.fullName || "Your Name"}
            </h1>
            <p className="text-gray-500 text-xs">Software Developer</p>
          </div>
          <div className="text-right text-xs">
            {personal.email && <div className="text-blue-600">{personal.email}</div>}
            {personal.phone && <div className="text-gray-600">{personal.phone}</div>}
            {personal.location && <div className="text-gray-500">{personal.location}</div>}
            {personal.linkedin && <div className="text-blue-600">gh/in/{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</div>}
            {personal.github && <div className="text-blue-600">github.com/{personal.github}</div>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>About</h2>
          </div>
          <p className={cn("text-gray-700 leading-tight", fontSizes.name)}>{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>Experience</h2>
          </div>
          <div className={spacing}>
            {experience.map((exp) => (
              <div key={exp.id} className="pl-4 border-l border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900">{exp.role}</span>
                    <span className="text-gray-500"> @ </span>
                    <span className="text-blue-600">{exp.company}</span>
                    {exp.location && <span className="text-gray-400 text-xs ml-1">({exp.location})</span>}
                  </div>
                  <span className="text-xs text-gray-400">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) : ""}
                    {" → "}
                    {exp.isCurrent ? "now" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) : ""}
                  </span>
                </div>
                {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <div key={i} className="text-gray-600 mt-0.5 flex">
                    <span className="text-green-600 mr-2">+</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>Education</h2>
          </div>
          <div className={spacing}>
            {education.map((edu) => (
              <div key={edu.id} className="pl-4 border-l border-gray-200">
                <div className="flex justify-between">
                  <div>
                    <span className="font-bold text-gray-900">{edu.degree}</span>
                    {edu.field && <span className="text-gray-600"> in {edu.field}</span>}
                    <span className="text-gray-500"> @ </span>
                    <span className="text-blue-600">{edu.institution}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
                    {edu.endDate ? `-${new Date(edu.endDate).getFullYear()}` : ""}
                    {edu.gpa && <span className="ml-1"> | {edu.gpa}</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Skills - Grid Layout */}
      {skills.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>Tech Stack</h2>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-start gap-2">
                <span className="font-bold text-gray-900 text-xs">{skill.category}:</span>
                <span className="text-gray-600 text-xs">{skill.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>Projects</h2>
          </div>
          <div className={spacing}>
            {projects.map((project) => (
              <div key={project.id} className="pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">◆</span>
                  <span className="font-bold text-gray-900">{project.name}</span>
                  {project.githubUrl && (
                    <a href={project.githubUrl} className="text-blue-600 text-xs">[code]</a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} className="text-blue-600 text-xs">[demo]</a>
                  )}
                </div>
                {project.technologies.length > 0 && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    // {project.technologies.join(" | ")}
                  </div>
                )}
                {project.description && (
                  <p className="text-gray-600 mt-0.5">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>Certifications</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <span key={cert.id} className="text-xs border border-gray-300 px-2 py-0.5 rounded">
                [{cert.name}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: primaryColor }}>▌</span>
            <h2 className={cn("font-bold text-xs uppercase", fontSizes.heading)}>Languages</h2>
          </div>
          <div className="flex gap-4">
            {languages.map((lang) => (
              <span key={lang.id} className="text-xs">
                <span className="font-bold text-gray-900">{lang.language}</span>
                <span className="text-gray-500 ml-1">{proficiencyLevels[lang.proficiency] || "○○○○○"}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}