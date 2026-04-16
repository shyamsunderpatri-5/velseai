import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { jobDescription, resume } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description required" }, { status: 400 });
    }

    const prompt = `Extract the top 10-15 most important keywords from this job description. Focus on:
- Technical skills (programming languages, tools, frameworks)
- Soft skills (leadership, communication, etc.)
- Industry-specific terms
- Required certifications or qualifications

Job Description:
${jobDescription}

Return ONLY a JSON array of keywords with their categories. Example:
[
  {"keyword": "python", "category": "Technical"},
  {"keyword": "leadership", "category": "Soft Skills"},
  {"keyword": "agile", "category": "Process"}
]`;

    const result = await generateText(prompt, {
      temperature: 0.3,
      maxTokens: 500,
    });

    let keywords = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        keywords = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse keywords:", e);
    }

    return NextResponse.json({ keywords });
  } catch (error: any) {
    console.error("Extract keywords error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract keywords" },
      { status: 500 }
    );
  }
}