import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai";

const coverLetterSchema = z.object({
  resumeId: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().optional(),
  jobDescription: z.string().min(100, "Job description is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = coverLetterSchema.safeParse(body);

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

    const { jobTitle, companyName, jobDescription, resumeId } = parsed.data;

    const prompt = `Generate a professional cover letter for the following job:

Job Title: ${jobTitle}
${companyName ? `Company: ${companyName}` : ""}

Job Description:
${jobDescription}

Write a compelling cover letter that:
- Addresses the specific requirements in the job description
- Highlights relevant skills and experience
- Is professional, concise (300-400 words), and tailored to the role
- Uses a clean, modern tone suitable for an Indian job application

Return ONLY the cover letter content, no explanations or formatting notes.`;

    const coverLetter = await generateText(prompt);

    if (!coverLetter) {
      return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
    }

    // Save to database if resumeId provided
    if (resumeId) {
      await supabase.from("cover_letters").insert({
        user_id: user.id,
        resume_id: resumeId,
        title: `Cover Letter for ${jobTitle}`,
        content: coverLetter,
      });
    }

    // Track usage
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      feature: "cover_letter",
      model_used: "ollama/openai",
    });

    return NextResponse.json({ success: true, coverLetter });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}