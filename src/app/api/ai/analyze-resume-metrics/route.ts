import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredWithOpenAI } from "@/lib/ai";
import { FinalAnalysisSchema, zodToJsonSchema } from "@/lib/ai/structured-outputs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume, jobDescription, resumeId } = body;

    if (!resume) {
      return NextResponse.json({ error: "Resume content required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const prompt = `
      As an Elite ATS (Applicant Tracking System) Auditor with a "Ruthless Auditor" persona, analyze the following resume data against 23 core industry metrics.
      
      YOUR GOAL: Provide a strict, high-fidelity audit. Be critical. If a metric is weak, mark it as 'fail' or 'warning'. A score of 100 must be extremely difficult to achieve.
      
      METRIC CATEGORIES:
      1. Foundational: summary, contact_name, contact_email, contact_phone, contact_location, contact_linkedin, skills, education.
      2. Impact: action_verbs, quantification, bullet_length, bullet_count, achievement_focus, impact_statements.
      3. Formatting: length, fonts, headings, photos, layout, consistency.
      4. Optimization: keywords, tailoring, job_match (if JD provided).

      RESUME DATA:
      ${JSON.stringify(resume, null, 2)}

      ${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : "NO JOB DESCRIPTION PROVIDED. Focus on general ATS best practices."}

      ANALYSIS REQUIREMENTS:
      - Assign a score (0.0 to 1.0) and status ('pass', 'fail', 'warning') to EACH of the 23 metrics.
      - If a JD is provided, perform a deep keyword match and return a 'match' object with compatibility_score.
      - Provide a 1-sentence 'suggestion' for every non-passing metric.
      - Generate a 'top_priority_fixes' list (maximum 5 items) for the biggest score boosters.
    `;

    const result = await generateStructuredWithOpenAI(
      prompt,
      zodToJsonSchema(FinalAnalysisSchema),
      { temperature: 0.2 }
    );

    // ─── Score Persistence — Track history for Analytics ───────────────
    if (resumeId && result.total_score) {
      const { data: current } = await supabase
        .from("resumes")
        .select("score_history")
        .eq("id", resumeId)
        .single();

      const newHistory = [
        ...(current?.score_history || []),
        { score: result.total_score, date: new Date().toISOString() }
      ].slice(-20); // Keep last 20 snapshots

      await supabase
        .from("resumes")
        .update({ 
          ats_score: result.total_score,
          score_history: newHistory,
          updated_at: new Date().toISOString()
        })
        .eq("id", resumeId);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analyze metrics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze" },
      { status: 500 }
    );
  }
}