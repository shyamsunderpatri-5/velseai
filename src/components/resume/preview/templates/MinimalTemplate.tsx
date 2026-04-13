"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

export function MinimalTemplate({ content, settings }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages } = content;
  const primaryColor = settings.primaryColor || "#1A1A2E";

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
    <div className="p-8 bg-white text-gray-900 font-body max-w-[800px] mx-auto" style={{ fontFamily: settings.fontFamily }}>
      {/* Minimal Header */}
      <div className="mb-6">
        <h1 className={cn("font-heading font-bold text-2xl text-gray-900 tracking-tight", fontSizes.heading)} style={{ color: primaryColor }}>
          {personal.fullName || "Your Name"}
        </h1>
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 mt-2", fontSizes.name)}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span className="text-blue-600">{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-6">
          <p className={cn("text-gray-600 leading-relaxed", fontSizes.name)}>{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-sm uppercase tracking-widest mb-3", fontSizes.heading)} style={{ color: primaryColor }}>
            Experience
          </h2>
          <div className={spacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{exp.role}</h3>
                    <p className="text-gray-500 text-xs">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                    {" – "}
                    {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                  </span>
                </div>
                {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                  <p key={i} className="text-gray-600 mt-1" style={{ fontSize: parseFloat(fontSizes.name.replace("text-", "")) - 2 + "px" }}>
                    {bullet}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-sm uppercase tracking-widest mb-3", fontSizes.heading)} style={{ color: primaryColor }}>
            Education
          </h2>
          <div className={spacing}>
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</h3>
                  <p className="text-gray-500 text-xs">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
                  {edu.endDate ? ` – ${new Date(edu.endDate).getFullYear()}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-sm uppercase tracking-widest mb-3", fontSizes.heading)} style={{ color: primaryColor }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {skills.map((skill) => (
              <span key={skill.id} className={cn("text-gray-600", fontSizes.name)}>
                <span className="font-medium text-gray-900">{skill.category}:</span> {skill.skills.join(", ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-sm uppercase tracking-widest mb-3", fontSizes.heading)} style={{ color: primaryColor }}>
            Projects
          </h2>
          <div className={spacing}>
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className={cn("font-semibold text-gray-900", fontSizes.name)}>
                  {project.name}
                  {project.technologies.length > 0 && (
                    <span className="font-normal text-gray-500 ml-2">— {project.technologies.join(", ")}</span>
                  )}
                </h3>
                {project.description && (
                  <p className="text-gray-600" style={{ fontSize: parseFloat(fontSizes.name.replace("text-", "")) - 2 + "px" }}>{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h2 className={cn("font-heading font-semibold text-sm uppercase tracking-widest mb-3", fontSizes.heading)} style={{ color: primaryColor }}>
            Certifications
          </h2>
          <div className="flex flex-col gap-1">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className={cn("text-gray-900 font-medium", fontSizes.name)}>{cert.name}</span>
                <span className="text-gray-400 text-xs">{cert.issuer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <h2 className={cn("font-heading font-semibold text-sm uppercase tracking-widest mb-3", fontSizes.heading)} style={{ color: primaryColor }}>
            Languages
          </h2>
          <div className="flex gap-6">
            {languages.map((lang) => (
              <span key={lang.id} className={cn("text-gray-600", fontSizes.name)}>
                <span className="font-medium text-gray-900">{lang.language}</span> — {lang.proficiency}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}