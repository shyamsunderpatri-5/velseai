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
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

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
  template?: "modern" | "classic" | "minimal" | "institutional" | "lebenslauf" | "viral_sidebar" | "elite_future";
  locale?: string;
  accentColor?: { r: number; g: number; b: number }; // 0-1 scale
  photoUrl?: string; // Optional headshot/profile photo
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

  pdfDoc.registerFontkit(fontkit);

  // Load standard fonts as fallback
  const fontSerifReg = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSerifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Load Custom Inter Fonts
  const fontsPath = path.join(process.cwd(), "src", "lib", "pdf", "fonts");
  const interRegBytes = fs.readFileSync(path.join(fontsPath, "Inter-Regular.otf"));
  const interBoldBytes = fs.readFileSync(path.join(fontsPath, "Inter-Bold.otf"));
  const interItalicBytes = fs.readFileSync(path.join(fontsPath, "Inter-Italic.otf"));

  const fontReg = await pdfDoc.embedFont(interRegBytes);
  const fontBold = await pdfDoc.embedFont(interBoldBytes);
  const fontItalic = await pdfDoc.embedFont(interItalicBytes);

  const templateType = options.template || "modern";
  const isSerif = templateType === "classic" || templateType === "lebenslauf";
  const isViral = templateType === "viral_sidebar";
  const isElite = templateType === "elite_future";
  
  const fBold = isSerif ? fontSerifBold : fontBold;
  const fReg = isSerif ? fontSerifReg : fontReg;
  const fItalic = isSerif ? fontSerifReg : fontItalic; // Approximation

  const accent = rgb(accentColor.r, accentColor.g, accentColor.b);
  const accentLight = rgb(accentColor.r * 0.15 + 0.85, accentColor.g * 0.1 + 0.9, accentColor.b * 0.15 + 0.85);

  // Layout Config
  const SIDEBAR_W = isViral ? 170 : 0;
  const MAIN_X = isViral ? SIDEBAR_W + 30 : MARGIN_X;
  const MAIN_W = isViral ? PAGE_W - MAIN_X - MARGIN_X : CONTENT_W;

  // Page state — auto-paginate
  const pages: PDFPage[] = [];
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  pages.push(page);
  let y = PAGE_H - MARGIN_Y;

  // ── Helper: draw sidebar background (for Viral) ───────────────────────────
  function drawSidebarBg(pg: PDFPage) {
    if (isViral) {
      pg.drawRectangle({
        x: 0,
        y: 0,
        width: SIDEBAR_W,
        height: PAGE_H,
        color: accentLight,
      });
    }
  }
  drawSidebarBg(page);

  // ── Helper: ensure space, add new page if needed ──────────────────────────
  function ensureSpace(height: number) {
    if (y - height < MARGIN_Y + 20) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      pages.push(page);
      drawSidebarBg(page);
      y = PAGE_H - MARGIN_Y;
    }
  }

  // ── Helper: draw section heading ──────────────────────────────────────────
  function drawSectionHeading(title: string, yPos: number, xPos = MAIN_X, width = MAIN_W): number {
    const isInstitutional = templateType === "institutional";
    const barColor = isInstitutional ? COLORS.black : isElite ? accent : COLORS.lightGray;
    const textColor = isInstitutional || isElite ? COLORS.white : accent;

    if (isElite) {
      // Futuristic geometric header
      page.drawRectangle({
        x: xPos,
        y: yPos - 2,
        width: 4,
        height: 18,
        color: accent,
      });
      page.drawText(title.toUpperCase(), {
        x: xPos + 10,
        y: yPos + 2,
        size: 9,
        font: fBold,
        color: COLORS.black,
      });
      page.drawLine({
        start: { x: xPos + 10, y: yPos - 4 },
        end: { x: xPos + width, y: yPos - 4 },
        thickness: 0.5,
        color: accent,
      });
      // Geometric enclosing bar
      page.drawRectangle({
        x: xPos + width,
        y: yPos - 4,
        width: 4,
        height: 4,
        color: accent,
      });
    } else {
      page.drawRectangle({
        x: xPos,
        y: yPos - 2,
        width: width,
        height: 18,
        color: barColor,
      });
      page.drawText(title.toUpperCase(), {
        x: xPos + 4,
        y: yPos + 2,
        size: 8.5,
        font: fBold,
        color: textColor,
      });
    }
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
  // HEADER (Smart Reflow + Photo Support)
  // ─────────────────────────────────────────────────────────────────────────────

  const isMinimal = templateType === "minimal";
  const isInstitutional = templateType === "institutional";

  // Name
  const nameSize = isMinimal ? 22 : isElite ? 36 : 26;
  if (isMinimal) {
    const nameW = fBold.widthOfTextAtSize(content.personal_info.name, nameSize);
    page.drawText(content.personal_info.name, {
      x: (PAGE_W - nameW) / 2,
      y,
      size: nameSize,
      font: fBold,
      color: COLORS.black,
    });
  } else if (isViral) {
    // Top Name across both columns
    page.drawText(content.personal_info.name, {
      x: MARGIN_X,
      y,
      size: 28,
      font: fBold,
      color: COLORS.black,
    });
  } else if (isElite) {
    page.drawText(content.personal_info.name.toUpperCase(), {
      x: MARGIN_X,
      y,
      size: nameSize,
      font: fBold,
      color: COLORS.black,
    });
  } else {
    page.drawText(content.personal_info.name, {
      x: MARGIN_X,
      y,
      size: nameSize,
      font: fBold,
      color: COLORS.black,
    });
  }
  y -= nameSize + (isMinimal || isElite ? 4 : 6);

  // Contact line
  const contactParts = [
    content.personal_info.email,
    content.personal_info.phone,
    content.personal_info.location,
    content.personal_info.linkedin && `ln: ${content.personal_info.linkedin.replace(/.*\/in\//, "")}`,
  ].filter(Boolean) as string[];

  const contactLine = contactParts.join("  ·  ");
  if (isMinimal) {
    const contactW = fReg.widthOfTextAtSize(contactLine, 8);
    page.drawText(contactLine, { x: (PAGE_W - contactW) / 2, y, size: 8, font: fReg, color: COLORS.gray });
    y -= 12;
  } else if (isViral) {
    page.drawText(contactLine, { x: MARGIN_X, y, size: 8, font: fReg, color: COLORS.darkGray });
    y -= 14;
  } else {
    page.drawText(contactLine, { x: MARGIN_X, y, size: 8.5, font: fReg, color: COLORS.gray });
    y -= 14;
  }

  // Accent divider
  if (!isMinimal && !isViral) {
    const dividerColor = isInstitutional ? COLORS.black : accent;
    page.drawLine({
      start: { x: MARGIN_X, y },
      end: { x: PAGE_W - MARGIN_X, y },
      thickness: isInstitutional ? 2 : isElite ? 3 : 1.5,
      color: dividerColor,
    });
    y -= 14;
  } else if (isViral) {
    y -= 25; // Space for viral header to settle
  } else {
    y -= 16;
  }

  // ── VIRAL SIDEBAR CONTENT: Skills & Edu ──────────────────────────────────
  let sidebarY = y;
  if (isViral) {
    // We'll draw skills and education in the sidebar later,
    // for now we just adjust the main Y to start at the top of the main column.
    // Actually, let's draw them immediately.
    
    // Summary in Sidebar? No, experience in main. 
    // Let's put Skills & Contact details in sidebar.
    
    sidebarY = y;
    page.drawText("CONTACT", { x: MARGIN_X, y: sidebarY, size: 9, font: fBold, color: accent });
    sidebarY -= 15;
    for (const part of contactParts) {
      const lines = wrapText(part, fReg, 8, SIDEBAR_W - MARGIN_X - 10);
      for (const l of lines) {
        page.drawText(l, { x: MARGIN_X, y: sidebarY, size: 8, font: fReg, color: COLORS.darkGray });
        sidebarY -= 12;
      }
      sidebarY -= 4;
    }

    sidebarY -= 20;
    page.drawText("EXPERTISE", { x: MARGIN_X, y: sidebarY, size: 9, font: fBold, color: accent });
    sidebarY -= 15;
    for (const skill of content.skills) {
      page.drawText(skill.toUpperCase(), { x: MARGIN_X, y: sidebarY, size: 7.5, font: fBold, color: COLORS.darkGray });
      sidebarY -= 14;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────

  if (content.summary) {
    ensureSpace(50);
    y = drawSectionHeading("Professional Summary", y);
    const lines = wrapText(content.summary, fItalic, 9.5, MAIN_W);
    for (const line of lines) {
      ensureSpace(14);
      page.drawText(line, { x: MAIN_X, y, size: 9.5, font: fItalic, color: COLORS.darkGray });
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
      const dateWidth = fReg.widthOfTextAtSize(dateStr, 9);
      page.drawText(exp.title, { x: MAIN_X, y, size: 10.5, font: fBold, color: COLORS.black });
      page.drawText(dateStr, {
        x: MAIN_X + MAIN_W - dateWidth,
        y,
        size: 9,
        font: fReg,
        color: COLORS.gray,
      });
      y -= 14;

      // Company + location
      const companyLine = exp.location ? `${exp.company}  ·  ${exp.location}` : exp.company;
      page.drawText(companyLine, { x: MAIN_X, y, size: 9.5, font: fItalic, color: accent });
      y -= 14;

      // Bullets
      for (const bullet of exp.bullets) {
        const bulletLines = wrapText(`• ${bullet}`, fReg, 9, MAIN_W - 12);
        for (let i = 0; i < bulletLines.length; i++) {
          ensureSpace(14);
          const indent = i === 0 ? 0 : 8;
          page.drawText(bulletLines[i], {
            x: MAIN_X + indent,
            y,
            size: 9,
            font: fReg,
            color: COLORS.darkGray,
          });
          y -= 13; // increased leading
        }
      }
      y -= 6;
    }
    y -= 4;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SKILLS (Standard Templates)
  // ─────────────────────────────────────────────────────────────────────────────

  if (!isViral && content.skills.length > 0) {
    ensureSpace(40);
    y = drawSectionHeading("Skills", y);

    let xCursor = MARGIN_X;
    const chipH = 16;
    const chipPadX = 6;
    const chipGapX = 4;
    const chipGapY = 6;

    for (const skill of content.skills) {
      const textW = fReg.widthOfTextAtSize(skill, 8.5);
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
        font: fReg,
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
    const eduTitle = templateType === "lebenslauf" ? "Ausbildung" : "Education";
    y = drawSectionHeading(eduTitle, y);

    for (const edu of content.education) {
      ensureSpace(28);
      const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      page.drawText(degreeStr, { x: MAIN_X, y, size: 10, font: fBold, color: COLORS.black });
      if (edu.graduation_year) {
        const yrW = fReg.widthOfTextAtSize(edu.graduation_year, 9);
        page.drawText(edu.graduation_year, { x: MAIN_X + MAIN_W - yrW, y, size: 9, font: fReg, color: COLORS.gray });
      }
      y -= 13;
      page.drawText(edu.institution, { x: MAIN_X, y, size: 9, font: fItalic, color: accent });
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
      page.drawText(proj.name, { x: MAIN_X, y, size: 10, font: fBold, color: COLORS.black });
      y -= 13;
      const descLines = wrapText(proj.description, fReg, 9, MAIN_W);
      for (const line of descLines) {
        ensureSpace(12);
        page.drawText(line, { x: MAIN_X, y, size: 9, font: fReg, color: COLORS.darkGray });
        y -= 12;
      }
      if (proj.tech && proj.tech.length > 0) {
        page.drawText(`Stack: ${proj.tech.join(", ")}`, { x: MAIN_X, y, size: 8.5, font: fItalic, color: COLORS.gray });
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
      font: fReg,
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
