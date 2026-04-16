import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/posthog";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const resumeId = request.nextUrl.searchParams.get("resumeId");
  const templateId = request.nextUrl.searchParams.get("templateId") || "modern";

  if (!resumeId) {
    return NextResponse.json({ error: "Resume ID required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const content = resume.content as Record<string, unknown>;

  const html = generateModernTemplateHTML(content);

  const pdfHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; font-size: 10pt; line-height: 1.4; color: #1a1a1a; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid #1A1A2E; padding-bottom: 16px; min-height: 100px; }
        .header-content { flex: 1; }
        .photo-container { width: 90px; height: 110px; margin-left: 20px; overflow: hidden; border-radius: 8px; flex-shrink: 0; }
        .photo-container img { width: 100%; height: 100%; object-fit: cover; }
        .name { font-size: 20pt; font-weight: 700; color: #1A1A2E; margin-bottom: 4px; }
        .role { font-size: 11pt; color: #666; font-weight: 500; }
        .contact { text-align: right; font-size: 8pt; color: #666; }
        .contact p { margin: 2px 0; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 11pt; font-weight: 700; color: #1A1A2E; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary { font-size: 9pt; color: #333; line-height: 1.6; margin-bottom: 12px; }
        .experience-item { margin-bottom: 14px; }
        .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
        .exp-title { font-weight: 700; font-size: 10.5pt; color: #111; }
        .exp-company { color: #444; font-size: 9.5pt; font-weight: 500; }
        .exp-date { font-size: 8.5pt; color: #777; font-weight: 600; }
        .bullet { font-size: 9pt; color: #333; padding-left: 14px; margin: 4px 0; line-height: 1.4; }
        .bullet::before { content: "• "; position: absolute; margin-left: -14px; color: #1A1A2E; }
        .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
        .skill-category { margin-bottom: 4px; }
        .skill-category-title { font-weight: 700; font-size: 9pt; color: #1A1A2E; }
        .skill-list { font-size: 9pt; color: #333; }
        .education-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .edu-degree { font-weight: 700; font-size: 10.5pt; color: #111; }
        .edu-school { font-size: 9.5pt; color: #444; }
        .edu-date { font-size: 8.5pt; color: #777; font-weight: 600; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  try {
    const response = await fetch(process.env.PUPPETEER_URL || "http://localhost:3001", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: pdfHtml, templateId }),
    });

    if (!response.ok) {
      throw new Error("PDF generation failed");
    }

    const pdfBuffer = await response.arrayBuffer();

    // Track successful PDF export
    await captureServerEvent("export_clicked", {
      distinctId: user.id,
      format: "pdf",
      resume_id: resumeId,
      template_id: templateId
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resume.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    await captureServerEvent("export_failed", {
      distinctId: user.id,
      format: "pdf",
      resume_id: resumeId,
      error: error instanceof Error ? error.message : "unknown"
    });
    
    // Capture exception in Sentry
    Sentry.captureException(error);
    
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    );
  }
}

function generateModernTemplateHTML(content: Record<string, unknown>): string {
  const personal = content.personal as Record<string, string> || {};
  const experience = content.experience as Array<Record<string, unknown>> || [];
  const education = content.education as Array<Record<string, string>> || [];
  const skills = content.skills as Array<Record<string, unknown>> || [];
  const projects = content.projects as Array<Record<string, unknown>> || [];

  return `
    <div class="header">
      <div>
        <div class="name">${personal.fullName || "Your Name"}</div>
        <div class="role">${personal.summary || ""}</div>
      </div>
      <div class="contact">
        ${personal.email ? `<p>${personal.email}</p>` : ""}
        ${personal.phone ? `<p>${personal.phone}</p>` : ""}
        ${personal.location ? `<p>${personal.location}</p>` : ""}
        ${personal.linkedin ? `<p>${personal.linkedin}</p>` : ""}
      </div>
    </div>

    ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${experience.map((exp: Record<string, unknown>) => `
        <div class="experience-item">
          <div class="exp-header">
            <span class="exp-title">${exp.role || ""}</span>
            <span class="exp-date">${exp.startDate || ""} - ${exp.isCurrent ? "Present" : exp.endDate || ""}</span>
          </div>
          <div class="exp-company">${exp.company || ""}${exp.location ? `, ${exp.location}` : ""}</div>
          ${(exp.bulletPoints as string[] || []).filter(b => b).map(b => `<div class="bullet">${b}</div>`).join("")}
        </div>
      `).join("")}
    </div>
    ` : ""}

    ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${education.map((edu: Record<string, string>) => `
        <div class="education-item">
          <div>
            <div class="edu-degree">${edu.degree}${edu.field ? ` in ${edu.field}` : ""}</div>
            <div class="edu-school">${edu.institution || ""}${edu.location ? `, ${edu.location}` : ""}</div>
          </div>
          <div class="edu-date">${edu.startDate ? new Date(edu.startDate).getFullYear() : ""} - ${edu.endDate ? new Date(edu.endDate).getFullYear() : ""}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}

    ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-grid">
        ${skills.map((skill: Record<string, unknown>) => `
          <div class="skill-category">
            <span class="skill-category-title">${skill.category || "Skills"}:</span>
            <span class="skill-list">${(skill.skills as string[] || []).join(", ")}</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    ${projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${projects.map((project: Record<string, unknown>) => `
        <div class="experience-item">
          <div class="exp-header">
            <span class="exp-title">${project.name || ""}</span>
            ${(project.technologies as string[])?.length ? `<span class="exp-date">${(project.technologies as string[]).join(", ")}</span>` : ""}
          </div>
          ${project.description ? `<div class="summary">${project.description}</div>` : ""}
          ${(project.bulletPoints as string[] || []).filter(b => b).map(b => `<div class="bullet">${b}</div>`).join("")}
        </div>
      `).join("")}
    </div>
    ` : ""}
  `;
}
