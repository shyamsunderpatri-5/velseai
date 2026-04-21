import { NextRequest, NextResponse } from "next/server";
import { generatePremiumPDF } from "@/lib/ats/pdf-service";

export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json({ error: "No content provided for PDF generation." }, { status: 400 });
    }

    const pdfBuffer = await generatePremiumPDF(html, ""); // outputPath not used by the stream logic we built

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename || "Selvo-Optimization-Protocol.pdf"}"`,
      },
    });
  } catch (error) {
    console.error("[PDF API Error]", error);
    return NextResponse.json({ error: "Failed to generate premium optimization asset." }, { status: 500 });
  }
}
