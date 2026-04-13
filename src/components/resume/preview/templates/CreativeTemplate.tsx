"use client";

import * as React from "react";
import { ResumeContent, ResumeSettings } from "@/types/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
  settings: ResumeSettings;
}

export function CreativeTemplate({ content, settings }: TemplateProps) {
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
    <div className="flex bg-white text-gray-900 font-body" style={{ fontFamily: settings.fontFamily }}>
      {/* Left Sidebar - Color Accent */}
      <div className="w-1/4 min-w-[180px] p-4" style={{ backgroundColor: primaryColor }}>
        <div className="mb-6 pt-4">
          <h1 className={cn("font-heading font-bold text-white text-xl", fontSizes.heading)}>
            {personal.fullName || "Your Name"}
          </h1>
          <p className="text-white/70 text-xs mt-1">Professional</p>
        </div>

        {/* Contact in Sidebar */}
        <div className="space-y-3 text-white/80 text-xs">
          {personal.email && (
            <div className="flex items-center gap-2">
              <span>✉</span>
              <span className="truncate">{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{personal.location}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className="flex items-center gap-2">
              <span>🔗</span>
              <span className="truncate">{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</span>
            </div>
          )}
        </div>

        {/* Skills as Tags in Sidebar */}
        {skills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map((skill) => (
                <span key={skill.id} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {skill.skills.slice(0, 4).join(", ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 p-6">
        {/* Summary */}
        {personal.summary && (
          <div className="mb-6">
            <h2 className={cn("font-heading font-bold text-gray-900 pb-2 mb-3 border-b-2", fontSizes.heading)} style={{ borderColor: primaryColor }}>
              About Me
            </h2>
            <p className={cn("text-gray-700 leading-relaxed", fontSizes.name)}>{personal.summary}</p>
          </div>
        )}

        {/* Experience with Timeline */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className={cn("font-heading font-bold text-gray-900 pb-2 mb-3 border-b-2", fontSizes.heading)} style={{ borderColor: primaryColor }}>
              Experience
            </h2>
            <div className={spacing}>
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-gray-200">
                  <div className="absolute -left-2 top-2 w-4 h-4 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className={cn("font-bold text-gray-900", fontSizes.name)}>{exp.role}</h3>
                      <p className="text-gray-600 text-xs">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                      {" - "}
                      {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                    </span>
                  </div>
                  {exp.bulletPoints.filter(b => b.trim()).map((bullet, i) => (
                    <p key={i} className="text-xs text-gray-700 mt-1">{bullet}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className={cn("font-heading font-bold text-gray-900 pb-2 mb-3 border-b-2", fontSizes.heading)} style={{ borderColor: primaryColor }}>
              Education
            </h2>
            <div className={spacing}>
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-bold text-gray-900", fontSizes.name)}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</h3>
                    <p className="text-gray-600 text-xs">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
                    {edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-6">
            <h2 className={cn("font-heading font-bold text-gray-900 pb-2 mb-3 border-b-2", fontSizes.heading)} style={{ borderColor: primaryColor }}>
              Projects
            </h2>
            <div className={spacing}>
              {projects.map((project) => (
                <div key={project.id}>
                  <h3 className={cn("font-bold text-gray-900", fontSizes.name)}>{project.name}</h3>
                  {project.technologies.length > 0 && (
                    <p className="text-xs text-gray-500 mb-1">{project.technologies.join(" • ")}</p>
                  )}
                  {project.description && (
                    <p className={cn("text-gray-700", fontSizes.name)}>{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-6">
            <h2 className={cn("font-heading font-bold text-gray-900 pb-2 mb-3 border-b-2", fontSizes.heading)} style={{ borderColor: primaryColor }}>
              Certifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span key={cert.id} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                  {cert.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className={cn("font-heading font-bold text-gray-900 pb-2 mb-3 border-b-2", fontSizes.heading)} style={{ borderColor: primaryColor }}>
              Languages
            </h2>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <span key={lang.id} className={cn("text-gray-700", fontSizes.name)}>
                  {lang.language} <span className="text-gray-500">({lang.proficiency})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}