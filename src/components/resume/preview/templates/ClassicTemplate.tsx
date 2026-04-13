"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

export function ClassicTemplate({ content, settings }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages } = content;

  const fontSizeMap = {
    small: { name: "text-xs", heading: "text-sm" },
    medium: { name: "text-sm", heading: "text-base" },
    large: { name: "text-base", heading: "text-lg" },
  };

  const spacingMap = {
    compact: "space-y-1",
    normal: "space-y-2",
    spacious: "space-y-3",
  };

  const fontSizes = fontSizeMap[settings.fontSize];
  const spacing = spacingMap[settings.spacing];

  return (
    <div className="p-8 bg-white text-gray-900 font-body" style={{ fontFamily: settings.fontFamily }}>
      {/* Centered Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
        <h1 className={cn("font-heading font-bold text-2xl text-gray-900 uppercase tracking-wide", fontSizes.heading)}>
          {personal.fullName || "Your Name"}
        </h1>
        <div className={cn("text-gray-600 mt-2", fontSizes.name)}>
          {personal.email && <span>{personal.email}</span>}
          {personal.email && personal.phone && <span> | </span>}
          {personal.phone && <span>{personal.phone}</span>}
          {(personal.email || personal.phone) && personal.location && <span> | </span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
        <div className={cn("mt-1", fontSizes.name)}>
          {personal.linkedin && <span className="text-blue-700">{personal.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Summary
          </h2>
          <p className={cn("text-gray-700 leading-relaxed", fontSizes.name)}>{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Experience
          </h2>
          <div className={spacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className={cn("font-bold text-gray-900", fontSizes.name)}>{exp.role}</h3>
                    <p className="text-gray-600 text-xs">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                    {" - "}
                    {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className="text-xs text-gray-700 pl-4 mt-1">
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
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Education
          </h2>
          <div className={spacing}>
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className={cn("font-bold text-gray-900", fontSizes.name)}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</h3>
                  <p className="text-gray-600 text-xs">{edu.institution}{edu.location ? `, ${edu.location}` : ""}</p>
                </div>
                <p className="text-xs text-gray-600">
                  {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
                  {edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ""}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Skills
          </h2>
          <div className={spacing}>
            {skills.map((skill) => (
              <div key={skill.id} className="flex">
                <span className={cn("font-bold text-gray-900 w-32 flex-shrink-0", fontSizes.name)}>
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
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Projects
          </h2>
          <div className={spacing}>
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className={cn("font-bold text-gray-900", fontSizes.name)}>
                  {project.name}
                  {project.technologies.length > 0 && (
                    <span className="font-normal text-gray-600 ml-2">({project.technologies.join(", ")})</span>
                  )}
                </h3>
                {project.description && (
                  <p className={cn("text-gray-700", fontSizes.name)}>{project.description}</p>
                )}
                {project.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className="text-xs text-gray-700 pl-4">
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
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Certifications
          </h2>
          <div className={spacing}>
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className={cn("font-bold text-gray-900", fontSizes.name)}>{cert.name}</span>
                <span className="text-xs text-gray-600">{cert.issuer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <h2 className={cn("font-heading font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-400 pb-1 mb-2", fontSizes.heading)}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <span key={lang.id} className={cn("text-gray-700 font-medium", fontSizes.name)}>
                {lang.language}: {lang.proficiency}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}