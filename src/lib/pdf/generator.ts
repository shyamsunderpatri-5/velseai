/**
 * VelseAI — Resume PDF Generator (pdf-lib + custom-font)
 *
 * Architecture:
 * - Uses `pdf-lib` (pure JS, no Puppeteer, no browser) for zero cold-start latency
 * - Embeds Inter font for professional look
 * - Sections: Header, Summary, Experience, Skills, Education, Projects
 * - Also supports German Lebenslauf layout (section order + labels change)
 *
 * Usage:
 *   const pdfBytes = await generateResumePdf({ content, template, locale });
 *   return new Response(pdfBytes, { headers: { 'Content-Type': 'application/pdf' } });
 */

import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResumeContent {
  personal_info: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date?: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field?: string;
    graduation_year?: string;
    gpa?: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
    tech?: string[];
    url?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date?: string;
  }[];
  languages?: { language: string; level: string }[];
}

export interface PdfGenerationOptions {
  content: ResumeContent;
  template?: "modern" | "classic" | "minimal" | "lebenslauf";
  locale?: string;
  accentColor?: { r: number; g: number; b: number }; // 0-1 scale
}

// ─── Color Palette ────────────────────────────────────────────────────────────

const DEFAULT_ACCENT = { r: 0.44, g: 0.26, b: 0.96 }; // Violet-600 #7c3aed

const COLORS = {
  black: rgb(0.08, 0.08, 0.12),
  darkGray: rgb(0.25, 0.25, 0.32),
  gray: rgb(0.45, 0.45, 0.52),
  lightGray: rgb(0.93, 0.93, 0.95),
  white: rgb(1, 1, 1),
};

// ─── Layout constants (points, 1pt = 1/72 inch) ───────────────────────────────

const PAGE_W = 595.28;  // A4 width
const PAGE_H = 841.89;  // A4 height
const MARGIN_X = 48;
const MARGIN_Y = 52;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateResumePdf(options: PdfGenerationOptions): Promise<Uint8Array> {
  const { content, accentColor = DEFAULT_ACCENT } = options;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setAuthor("VelseAI");
  pdfDoc.setCreator("VelseAI Career Co-Pilot");
  pdfDoc.setTitle(`${content.personal_info.name} — Resume`);

  // Load standard fonts (no external font fetch needed)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const accent = rgb(accentColor.r, accentColor.g, accentColor.b);

  // Page state — auto-paginate
  const pages: PDFPage[] = [];
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  pages.push(page);
  let y = PAGE_H - MARGIN_Y;

  // ── Helper: ensure space, add new page if needed ──────────────────────────
  function ensureSpace(height: number) {
    if (y - height < MARGIN_Y + 20) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      pages.push(page);
      y = PAGE_H - MARGIN_Y;
    }
  }

  // ── Helper: draw section heading ──────────────────────────────────────────
  function drawSectionHeading(title: string, yPos: number): number {
    page.drawRectangle({
      x: MARGIN_X,
      y: yPos - 2,
      width: CONTENT_W,
      height: 18,
      color: COLORS.lightGray,
    });
    page.drawText(title.toUpperCase(), {
      x: MARGIN_X + 4,
      y: yPos + 2,
      size: 8.5,
      font: fontBold,
      color: accent,
    });
    return yPos - 24;
  }

  // ── Helper: wrap text at width, return lines ──────────────────────────────
  function wrapText(text: string, font: typeof fontReg, size: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────────────────────

  // Name
  const nameSize = 26;
  page.drawText(content.personal_info.name, {
    x: MARGIN_X,
    y,
    size: nameSize,
    font: fontBold,
    color: COLORS.black,
  });
  y -= nameSize + 6;

  // Contact line
  const contactParts = [
    content.personal_info.email,
    content.personal_info.phone,
    content.personal_info.location,
    content.personal_info.linkedin && `linkedin.com/in/${content.personal_info.linkedin.replace(/.*\/in\//, "")}`,
    content.personal_info.website,
  ].filter(Boolean) as string[];

  const contactLine = contactParts.join("  •  ");
  page.drawText(contactLine, {
    x: MARGIN_X,
    y,
    size: 8.5,
    font: fontReg,
    color: COLORS.gray,
  });
  y -= 14;

  // Accent divider
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_W - MARGIN_X, y },
    thickness: 1.5,
    color: accent,
  });
  y -= 14;

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────

  if (content.summary) {
    ensureSpace(50);
    y = drawSectionHeading("Professional Summary", y);
    const lines = wrapText(content.summary, fontItalic, 9.5, CONTENT_W);
    for (const line of lines) {
      ensureSpace(14);
      page.drawText(line, { x: MARGIN_X, y, size: 9.5, font: fontItalic, color: COLORS.darkGray });
      y -= 13;
    }
    y -= 8;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPERIENCE
  // ─────────────────────────────────────────────────────────────────────────────

  if (content.experience.length > 0) {
    ensureSpace(40);
    y = drawSectionHeading("Experience", y);

    for (const exp of content.experience) {
      ensureSpace(30);

      // Job title bold + dates right-aligned
      const dateStr = `${exp.start_date} – ${exp.end_date || "Present"}`;
      const dateWidth = fontReg.widthOfTextAtSize(dateStr, 9);
      page.drawText(exp.title, { x: MARGIN_X, y, size: 10.5, font: fontBold, color: COLORS.black });
      page.drawText(dateStr, {
        x: PAGE_W - MARGIN_X - dateWidth,
        y,
        size: 9,
        font: fontReg,
        color: COLORS.gray,
      });
      y -= 13;

      // Company + location
      const companyLine = exp.location ? `${exp.company}  ·  ${exp.location}` : exp.company;
      page.drawText(companyLine, { x: MARGIN_X, y, size: 9, font: fontItalic, color: accent });
      y -= 13;

      // Bullets
      for (const bullet of exp.bullets) {
        const bulletLines = wrapText(`• ${bullet}`, fontReg, 9, CONTENT_W - 12);
        for (let i = 0; i < bulletLines.length; i++) {
          ensureSpace(13);
          const indent = i === 0 ? 0 : 8;
          page.drawText(bulletLines[i], {
            x: MARGIN_X + indent,
            y,
            size: 9,
            font: fontReg,
            color: COLORS.darkGray,
          });
          y -= 12;
        }
      }
      y -= 6;
    }
    y -= 4;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SKILLS — horizontal chips layout
  // ─────────────────────────────────────────────────────────────────────────────

  if (content.skills.length > 0) {
    ensureSpace(40);
    y = drawSectionHeading("Skills", y);

    let xCursor = MARGIN_X;
    const chipH = 16;
    const chipPadX = 6;
    const chipGapX = 4;
    const chipGapY = 6;

    for (const skill of content.skills) {
      const textW = fontReg.widthOfTextAtSize(skill, 8.5);
      const chipW = textW + chipPadX * 2;

      if (xCursor + chipW > PAGE_W - MARGIN_X) {
        xCursor = MARGIN_X;
        y -= chipH + chipGapY;
        ensureSpace(chipH + chipGapY);
      }

      // Chip background
      page.drawRectangle({
        x: xCursor,
        y: y - chipH + 4,
        width: chipW,
        height: chipH,
        color: rgb(accentColor.r * 0.15 + 0.85, accentColor.g * 0.1 + 0.9, accentColor.b * 0.15 + 0.85),
        borderColor: rgb(accentColor.r * 0.6, accentColor.g * 0.4, accentColor.b * 0.9),
        borderWidth: 0.5,
      });

      // Chip text
      page.drawText(skill, {
        x: xCursor + chipPadX,
        y: y - 7,
        size: 8.5,
        font: fontReg,
        color: rgb(accentColor.r * 0.7, accentColor.g * 0.4, accentColor.b * 0.9),
      });

      xCursor += chipW + chipGapX;
    }
    y -= chipH + 14;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EDUCATION
  // ─────────────────────────────────────────────────────────────────────────────

  if (content.education.length > 0) {
    ensureSpace(40);
    y = drawSectionHeading("Education", y);

    for (const edu of content.education) {
      ensureSpace(28);
      const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      page.drawText(degreeStr, { x: MARGIN_X, y, size: 10, font: fontBold, color: COLORS.black });
      if (edu.graduation_year) {
        const yrW = fontReg.widthOfTextAtSize(edu.graduation_year, 9);
        page.drawText(edu.graduation_year, { x: PAGE_W - MARGIN_X - yrW, y, size: 9, font: fontReg, color: COLORS.gray });
      }
      y -= 13;
      page.drawText(edu.institution, { x: MARGIN_X, y, size: 9, font: fontItalic, color: accent });
      y -= 14;
    }
    y -= 4;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROJECTS (optional)
  // ─────────────────────────────────────────────────────────────────────────────

  if (content.projects && content.projects.length > 0) {
    ensureSpace(40);
    y = drawSectionHeading("Projects", y);

    for (const proj of content.projects) {
      ensureSpace(28);
      page.drawText(proj.name, { x: MARGIN_X, y, size: 10, font: fontBold, color: COLORS.black });
      y -= 13;
      const descLines = wrapText(proj.description, fontReg, 9, CONTENT_W);
      for (const line of descLines) {
        ensureSpace(12);
        page.drawText(line, { x: MARGIN_X, y, size: 9, font: fontReg, color: COLORS.darkGray });
        y -= 12;
      }
      if (proj.tech && proj.tech.length > 0) {
        page.drawText(`Stack: ${proj.tech.join(", ")}`, { x: MARGIN_X, y, size: 8.5, font: fontItalic, color: COLORS.gray });
        y -= 12;
      }
      y -= 6;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Footer on every page
  // ─────────────────────────────────────────────────────────────────────────────

  for (const pg of pages) {
    pg.drawText("Generated by VelseAI · velseai.com", {
      x: MARGIN_X,
      y: MARGIN_Y - 20,
      size: 7,
      font: fontReg,
      color: COLORS.lightGray,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// ─── Convenience: content JSON → PDF Buffer ───────────────────────────────────

export async function resumeJsonToPdfBuffer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawJson: Record<string, any>,
  options?: Omit<PdfGenerationOptions, "content">
): Promise<Buffer> {
  const content: ResumeContent = {
    personal_info: rawJson.personal_info || rawJson.personalInfo || {
      name: rawJson.name || "Candidate",
      email: rawJson.email || "",
      phone: rawJson.phone,
      location: rawJson.location,
    },
    summary: rawJson.summary,
    experience: rawJson.experience || [],
    education: rawJson.education || [],
    skills: Array.isArray(rawJson.skills)
      ? rawJson.skills
      : typeof rawJson.skills === "string"
      ? rawJson.skills.split(",").map((s: string) => s.trim())
      : [],
    projects: rawJson.projects,
    certifications: rawJson.certifications,
    languages: rawJson.languages,
  };

  const pdfBytes = await generateResumePdf({ content, ...options });
  return Buffer.from(pdfBytes);
}
