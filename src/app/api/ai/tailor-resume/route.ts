import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredJSON } from "@/lib/ai";
import { z } from "zod";

const TailorSchema = z.object({
  tailored_summary: z.string().describe("A professional summary optimized with JD keywords, keeping it high-impact and under 3 lines."),
  tailored_skills: z.array(z.string()).describe("A list of 10-15 keywords and skills re-ordered and filtered based on the JD relevance."),
  experience_bullet_updates: z.array(z.object({
    experience_id: z.string(),
    optimized_bullets: z.array(z.string()).describe("A JD-optimized version of the bullet points for this specific role.")
  })).describe("Top 2 most relevant experience items with their bullets rewritten for JD keyword density.")
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobId, jd } = await request.json();

    if (!resumeId || !jd) {
      return NextResponse.json({ error: "Resume ID and JD are required" }, { status: 400 });
    }

    // 1. Fetch Source Resume
    const { data: sourceResume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !sourceResume) {
      return NextResponse.json({ error: "Source resume not found" }, { status: 404 });
    }

    // 2. Perform AI Tailoring Transformation
    const prompt = `
      System: You are an elite FAANG Recruiter and ATS Optimization Expert.
      Task: Tailor the following resume for the provided Job Description.
      
      Strategy: 
      1. Rewrite the professional summary to highlight matching skills.
      2. Re-prioritize skills that appear in the JD.
      3. Rewrite bullet points for the top 2 roles to use JD-specific action verbs and keywords (e.g. if the JD mentions "Next.js architecture", ensure the bullets reflect that specific phrasing).
      
      RESUME CONTENT:
      ${JSON.stringify(sourceResume.content)}
      
      JOB DESCRIPTION:
      ${jd}
    `;

    const tailoredData = await generateStructuredJSON<any>(
      prompt,
      TailorSchema,
      { temperature: 0.2 }
    );

    // 3. Clone and Mutate Content
    const newContent = JSON.parse(JSON.stringify(sourceResume.source_content || sourceResume.content));
    
    // Update Summary
    if (newContent.personal) {
      newContent.personal.summary = tailoredData.tailored_summary;
    }

    // Update Skills
    if (newContent.skills && newContent.skills.length > 0) {
      newContent.skills[0].skills = tailoredData.tailored_skills;
    }

    // Update Relevant Experience
    tailoredData.experience_bullet_updates.forEach(update => {
      const expIdx = newContent.experience.findIndex((e: any) => e.id === update.experience_id);
      if (expIdx !== -1) {
        newContent.experience[expIdx].bulletPoints = update.optimized_bullets;
      }
    });

    // 4. Persistence: Create new "Tailored" Resume
    const { data: newResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: sourceResume.title.includes("Tailored") 
          ? sourceResume.title 
          : `${sourceResume.title} | ${jobId || 'Job'} (Tailored)`,
        content: newContent,
        template_id: sourceResume.template_id,
        target_role: sourceResume.target_role,
        is_clone: true,
        parent_id: resumeId
      })
      .select()
      .single();

    if (createError) throw createError;

    // 5. Link Job Application if jobId provided
    if (jobId && !jobId.startsWith('elite-')) {
       await supabase
        .from("job_applications")
        .update({ resume_id: newResume.id })
        .eq("id", jobId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ 
      success: true, 
      newResumeId: newResume.id,
      message: "Resume tailored successfully" 
    });

  } catch (error) {
    console.error("Tailoring failed:", error);
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 });
  }
}
