import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/analytics/posthog";
import * as Sentry from "@sentry/nextjs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

const exportDocxSchema = z.object({
  resumeId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");

    const parsed = exportDocxSchema.safeParse({ resumeId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", parsed.data.resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const content = resume.content as {
      personal?: { name?: string; email?: string; phone?: string; location?: string; summary?: string };
      experience?: Array<{ company: string; role: string; startDate: string; endDate: string; description: string }>;
      education?: Array<{ institution: string; degree: string; field: string; year: string }>;
      skills?: string[];
      projects?: Array<{ name: string; description: string }>;
      certifications?: Array<{ name: string; issuer: string; year: string }>;
    };

    const children: Paragraph[] = [];

    // Name
    if (content?.personal?.name) {
      children.push(
        new Paragraph({
          text: content.personal.name,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Contact Info
    const contactParts: string[] = [];
    if (content?.personal?.email) contactParts.push(content.personal.email);
    if (content?.personal?.phone) contactParts.push(content.personal.phone);
    if (content?.personal?.location) contactParts.push(content.personal.location);

    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          text: contactParts.join(" | "),
          alignment: AlignmentType.CENTER,
        })
      );
      children.push(new Paragraph({ text: "" }));
    }

    // Summary
    if (content?.personal?.summary) {
      children.push(
        new Paragraph({
          text: "Summary",
          heading: HeadingLevel.HEADING_1,
        })
      );
      children.push(
        new Paragraph({
          text: content.personal.summary,
        })
      );
      children.push(new Paragraph({ text: "" }));
    }

    // Experience
    if (content?.experience && content.experience.length > 0) {
      children.push(
        new Paragraph({
          text: "Experience",
          heading: HeadingLevel.HEADING_1,
        })
      );

      for (const exp of content.experience) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.role, bold: true }),
              new TextRun({ text: " at " }),
              new TextRun({ text: exp.company }),
            ],
          })
        );
        const dateRange = `${exp.startDate} - ${exp.endDate || "Present"}`;
        children.push(new Paragraph({ text: dateRange }));
        if (exp.description) {
          children.push(new Paragraph({ text: exp.description }));
        }
        children.push(new Paragraph({ text: "" }));
      }
    }

    // Education
    if (content?.education && content.education.length > 0) {
      children.push(
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_1,
        })
      );

      for (const edu of content.education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun({ text: " in " }),
              new TextRun({ text: edu.field }),
            ],
          })
        );
        children.push(new Paragraph({ text: `${edu.institution} - ${edu.year}` }));
        children.push(new Paragraph({ text: "" }));
      }
    }

    // Skills
    if (content?.skills && content.skills.length > 0) {
      children.push(
        new Paragraph({
          text: "Skills",
          heading: HeadingLevel.HEADING_1,
        })
      );
      children.push(
        new Paragraph({
          text: content.skills.join(", "),
        })
      );
      children.push(new Paragraph({ text: "" }));
    }

    // Projects
    if (content?.projects && content.projects.length > 0) {
      children.push(
        new Paragraph({
          text: "Projects",
          heading: HeadingLevel.HEADING_1,
        })
      );

      for (const proj of content.projects) {
        children.push(
          new Paragraph({
            text: proj.name,
            heading: HeadingLevel.HEADING_2,
          })
        );
        if (proj.description) {
          children.push(new Paragraph({ text: proj.description }));
        }
        children.push(new Paragraph({ text: "" }));
      }
    }

    // Certifications
    if (content?.certifications && content.certifications.length > 0) {
      children.push(
        new Paragraph({
          text: "Certifications",
          heading: HeadingLevel.HEADING_1,
        })
      );

      for (const cert of content.certifications) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true }),
              new TextRun({ text: ` - ${cert.issuer}` }),
              new TextRun({ text: ` (${cert.year})` }),
            ],
          })
        );
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8Array = new Uint8Array(buffer);
    const date = new Date().toISOString().split("T")[0];
    const filename = `selvo-resume-${content?.personal?.name || "resume"}-${date}.docx`;

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    // Track failed export
    await captureServerEvent("export_failed", {
      distinctId: "anonymous",
      format: "docx",
      error: error instanceof Error ? error.message : "unknown"
    });
    
    // Capture exception in Sentry
    Sentry.captureException(error);
    
    console.error("DOCX export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}