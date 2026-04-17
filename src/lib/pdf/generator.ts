"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdfFromHtml(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with id ${elementId} not found in the DOM.`);
  }

  try {
    // 1. Wait a moment for browser to settle and ensure phantom layer is painted
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Capture with robust settings
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      logging: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1123,
      onclone: (clonedDoc) => {
        // Force standardized colors for html2canvas compatibility (Tailwind 4 uses oklch/lab which html2canvas fails on)
        const elements = clonedDoc.getElementsByTagName("*");
        const converter = clonedDoc.createElement("div");
        clonedDoc.body.appendChild(converter);

        for (let i = 0; i < elements.length; i++) {
          const el = elements[i] as HTMLElement;
          const style = window.getComputedStyle(el);
          
          const props = ["backgroundColor", "color", "borderColor", "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor"];
          
          props.forEach(prop => {
            const val = (style as any)[prop];
            if (val && (val.includes("oklch") || val.includes("lab"))) {
              // Force conversion to RGB by setting it on a temporary element and reading it back
              converter.style.color = val;
              (el.style as any)[prop] = window.getComputedStyle(converter).color;
            } else if (val) {
              (el.style as any)[prop] = val; // Force hardcoded result
            }
          });
        }
        clonedDoc.body.removeChild(converter);

        const target = clonedDoc.getElementById(elementId);
        if (target) {
          target.style.opacity = "1";
          target.style.visibility = "visible";
          target.style.left = "0";
          target.style.position = "relative";
        }
      }
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    if (imgData === "data:,") {
      throw new Error("Canvas is empty. Capture failed.");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("CRITICAL PDF ERROR:", error);
    throw new Error(`PDF Build Failed: ${error instanceof Error ? error.message : "Internal Capture Error"}`);
  }
}
