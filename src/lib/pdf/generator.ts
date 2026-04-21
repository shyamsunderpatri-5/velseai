"use client";

export async function generatePdfFromHtml(
  resumeData: any, 
  filename: string, 
  templateId: string = "modern"
): Promise<void> {
  try {
    const response = await fetch("/api/resume/export-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: resumeData,
        templateId,
        filename
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  }
}
