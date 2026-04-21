import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/posthog.server";
import * as Sentry from "@sentry/nextjs";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, templateId = "modern", filename = "resume" } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const html = generateResumeHTML(content, templateId);

    const pdfBuffer = await generatePDF(html);

    // Track successful PDF export
    await captureServerEvent("export_clicked", {
      distinctId: user.id,
      format: "pdf",
      template_id: templateId
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error instanceof Error ? error.message : "Internal Error"}` },
      { status: 500 }
    );
  }
}

// Fallback for GET if still used by some components
export async function GET(request: NextRequest) {
  const resumeId = request.nextUrl.searchParams.get("resumeId");
  const templateId = request.nextUrl.searchParams.get("templateId") || "modern";

  if (!resumeId) {
    return NextResponse.json({ error: "Resume ID required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const html = generateResumeHTML(resume.content as any, templateId);
  const pdfBuffer = await generatePDF(html);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf"`,
    },
  });
}

async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" }
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function generateResumeHTML(content: any, templateId: string): string {
  if (!content) return "<html><body>No content provided</body></html>";

  const personal = content.personal || {};
  const experience = content.experience || [];
  const education = content.education || [];
  const skills = content.skills || [];
  const projects = content.projects || [];
  const certs = content.certifications || content.certificates || [];

  // Unified getters to handle both ResumeContent and ExtractedResume schemas
  const getName = () => personal.fullName || personal.name || "Your Name";
  const getLocation = () => personal.location || (personal.city ? `${personal.city}${personal.country ? `, ${personal.country}` : ""}` : personal.country || "");
  const getExpBullets = (exp: any) => exp.bulletPoints || exp.responsibilities || [];
  const getProjTech = (p: any) => p.technologies || p.techStack || [];
  const getProjBullets = (p: any) => p.bulletPoints || p.achievements || [];

  // Skills normalization: handles both Skill[] (Editor) and Skills object (Builder)
  let normalizedSkills = [];
  if (Array.isArray(skills)) {
    normalizedSkills = skills;
  } else if (typeof skills === "object") {
    // ExtractedResume format: { technical: [], soft: [], tools: [], languages: [] }
    if (skills.technical?.length) normalizedSkills.push({ category: "Technical", skills: skills.technical });
    if (skills.tools?.length) normalizedSkills.push({ category: "Tools", skills: skills.tools });
    if (skills.soft?.length) normalizedSkills.push({ category: "Soft Skills", skills: skills.soft });
    if (skills.languages?.length) normalizedSkills.push({ category: "Stack", skills: skills.languages });
  }

  // Basic styles
  const isModern = templateId === "modern";
  const primaryColor = isModern ? "#2563eb" : "#1e293b";
  
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    :root {
      --primary: ${primaryColor};
      --secondary: #64748b;
      --accent: #2563eb;
      --text-main: #1a1a1a;
      --text-muted: #4b5563;
      --border: #e2e8f0;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.5;
      color: var(--text-main);
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      margin: 0 auto;
    }

    .header-modern {
      background: var(--primary);
      color: white;
      padding: 30px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-standard {
      padding: 30px 40px 10px 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border);
    }

    .name-container h1 {
      font-size: 26pt;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }

    .header-modern h1 { color: white; }
    .header-standard h1 { color: var(--primary); }

    .name-container p {
      font-size: 11pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .header-modern p { color: rgba(255, 255, 255, 0.8); }
    .header-standard p { color: var(--secondary); }

    .contact-info {
      text-align: right;
      font-size: 9pt;
    }

    .header-modern .contact-info { color: rgba(255, 255, 255, 0.9); }
    .header-standard .contact-info { color: var(--text-muted); }

    .main-content {
      padding: 0 40px 40px 40px;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 11pt;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .summary {
      font-size: 10.5pt;
      color: var(--text-main);
      line-height: 1.6;
    }

    .item {
      margin-bottom: 18px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .item-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .item-subtitle {
      font-size: 10pt;
      color: var(--text-muted);
      font-weight: 600;
    }

    .item-date {
      font-size: 9pt;
      color: var(--text-muted);
      font-weight: 700;
      background: #f8fafc;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .bullet-points {
      margin-top: 8px;
      padding-left: 4px;
    }

    .bullet {
      font-size: 10pt;
      color: #334155;
      margin-bottom: 4px;
      position: relative;
      list-style-type: none;
      padding-left: 18px;
    }

    .bullet::before {
      content: "";
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      opacity: 0.4;
    }

    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .skill-group {
      width: 100%;
    }

    .skill-label {
      font-weight: 700;
      font-size: 9pt;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      display: block;
    }

    .pill-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .pill {
      background: #f1f5f9;
      color: #475569;
      font-size: 8.5pt;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
  `;

  const headerClass = isModern ? "header-modern" : "header-standard";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${styles}</style>
    </head>
    <body>
      <div class="page">
        <div class="${headerClass}">
          <div class="name-container">
            <h1>${getName()}</h1>
            <p>${personal.targetRole || (experience[0]?.role) || "Professional"}</p>
          </div>
          <div class="contact-info">
            ${personal.email ? `<p>${personal.email}</p>` : ""}
            ${personal.phone ? `<p>${personal.phone}</p>` : ""}
            ${getLocation() ? `<p>${getLocation()}</p>` : ""}
            ${personal.linkedin ? `<p>${personal.linkedin.replace(/^https?:\/\//, "")}</p>` : ""}
          </div>
        </div>

        <div class="main-content">
          ${(personal.summary || content.summary) ? `
            <div class="section">
              <div class="section-title">Profile</div>
              <div class="summary">${personal.summary || content.summary}</div>
            </div>
          ` : ""}

          ${experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${experience.map((exp: any) => `
                <div class="item">
                  <div class="item-header">
                    <span class="item-title">${exp.role}</span>
                    <span class="item-date">${exp.startDate} - ${exp.isCurrent ? "Present" : exp.endDate}</span>
                  </div>
                  <div class="item-subtitle">${exp.company}${exp.location ? ` | ${exp.location}` : ""}</div>
                  ${getExpBullets(exp).length > 0 ? `
                    <ul class="bullet-points">
                      ${getExpBullets(exp).filter((b: string) => b.trim()).map((b: string) => `<li class="bullet">${b}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${education.length > 0 ? `
            <div class="section">
              <div class="section-title">Education</div>
              ${education.map((edu: any) => `
                <div class="item">
                  <div class="item-header">
                    <span class="item-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ""}</span>
                    <span class="item-date">${edu.startDate || edu.startYear} - ${edu.endDate || edu.endYear}</span>
                  </div>
                  <div class="item-subtitle">${edu.institution}${edu.location ? ` | ${edu.location}` : ""}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${normalizedSkills.length > 0 ? `
            <div class="section">
              <div class="section-title">Expertise</div>
              <div class="skills-container">
                ${normalizedSkills.map((s: any) => `
                  <div class="skill-group">
                    <span class="skill-label">${s.category}</span>
                    <div class="pill-container">
                      ${s.skills.map((skill: string) => `<span class="pill">${skill}</span>`).join("")}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          ${projects.length > 0 ? `
            <div class="section">
              <div class="section-title">Projects</div>
              ${projects.map((p: any) => `
                <div class="item">
                  <div class="item-header">
                    <span class="item-title">${p.name}</span>
                    <span class="item-date">${getProjTech(p).slice(0, 3).join(", ")}</span>
                  </div>
                  ${p.description ? `<p class="bullet" style="margin-top: 4px">${p.description}</p>` : ""}
                  ${getProjBullets(p).length > 0 ? `
                    <ul class="bullet-points">
                      ${getProjBullets(p).filter((b: string) => b.trim()).map((b: string) => `<li class="bullet">${b}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          ` : ""}
  `;
}
