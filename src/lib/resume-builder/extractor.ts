import { generateStructuredJSON } from "@/lib/ai";
import { zodToJsonSchema } from "@/lib/ai/structured-outputs";
import { ExtractedResumeSchema, ExtractedResume } from "./schemas";

export async function extractResumeData(rawText: string): Promise<ExtractedResume> {
  const jsonSchema = zodToJsonSchema(ExtractedResumeSchema);

  // 1. Clean & Compress Raw Text (Remove excess whitespace which inflates token counts)
  const cleanText = rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim()
    .slice(0, 30000); // Safety cut-off at ~7.5k tokens to prevent model crash

  const prompt = `### TASK: Map Resume to JSON.
### RULES:
- 100% data extraction.
- ALL bullet points verbatim.
- No summaries or omissions.
- CAP LIMIT: If Certificates or Projects exceed 15 items, only extract the 15 most recent/relevant.
- Return empty array [] for missing sections.

### SCHEMA:
${JSON.stringify(jsonSchema)}

### SOURCE:
${cleanText}`;

  try {
    const validatedData = await generateStructuredJSON<ExtractedResume>(prompt, jsonSchema, {
      temperature: 0.1,
      maxTokens: 8192,
      priority: "quality" // Use 1.5 Pro for massive resumes to prevent truncation
    });

    return validatedData;
  } catch (error) {
    console.error("Resume Extraction Error:", error);
    throw new Error("Failed to extract resume data accurately. Please try again.");
  }
}
