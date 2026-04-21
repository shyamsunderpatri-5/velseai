import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeJobDescription } from "@/lib/ai/extractor";
import { performNeuralAudit } from "@/lib/ats/auditor";
import { saveStoriesFromAudit } from "@/lib/ats/stories";
import { captureServerEvent } from "@/lib/analytics/posthog.server";

export async function POST(request: NextRequest) {
  try {
    const { url, resumeId, jobDescription: manualJD, companyName: manualCompany, jobTitle: manualTitle } = await request.json();

    if (!url && !manualJD) {
      return NextResponse.json({ error: "Missing job URL or description" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required for Auto-Pilot" }, { status: 401 });
    }

    // 1. SCAPE OR USE MANUAL
    let finalJD = manualJD || "";
    let finalCompany = manualCompany || "";
    let finalTitle = manualTitle || "";

    if (url) {
      console.log(`[Auto-Pilot] Attempting zero-token scrape for: ${url}`);
      const scraped = await scrapeJobDescription(url);
      if (scraped) {
        finalJD = scraped.description;
        finalCompany = scraped.company;
        finalTitle = scraped.title;
      } else {
        // If zero-token fails, we could fallback to a vision-based scrape or generic fetch
        // For now, if no automated scrapers match, we might need the user to paste text
        // But let's assume if it's a URL and we don't have a scraper, we warn.
        if (!finalJD) {
          return NextResponse.json({ 
            error: "Unsupported URL", 
            message: "We don't have a zero-token scraper for this portal yet. Please paste the JD text manually." 
          }, { status: 400 });
        }
      }
    }

    // 2. FETCH RESUME TEXT
    const { data: resumeData, error: resumeError } = await supabase
      .from("resumes")
      .select("content, last_ats_score")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resumeData) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resumeText = JSON.stringify(resumeData.content);

    // 3. PERFORM NEURAL AUDIT
    console.log(`[Auto-Pilot] Starting Neural Audit for ${finalCompany}...`);
    const auditResult = await performNeuralAudit({
      resumeText,
      jobDescription: finalJD,
      companyInfo: `Company: ${finalCompany}\nRole: ${finalTitle}`, // Could expand with search
      locale: "en",
    });

    // 4. SAVE TO DATABASE
    const { data: savedScore, error: saveError } = await supabase
      .from("ats_scores")
      .insert({
        resume_id: resumeId,
        user_id: user.id,
        job_description: finalJD,
        company_name: finalCompany || null,
        job_title: finalTitle || null,
        overall_score: auditResult.overall_score * 20, // Convert 0-5 to 100-scale for compat
        audit_score: auditResult.overall_score,
        audit_grade: auditResult.overall_grade,
        audit_report: auditResult,
        archetype: auditResult.archetype,
        legitimacy_tier: auditResult.legitimacy_tier,
        resume_text: resumeText.slice(0, 5000),
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("[Auto-Pilot] Database save failed:", saveError);
    }

    // 4.5 PERSIST STORIES
    if (savedScore?.id) {
      await saveStoriesFromAudit(user.id, auditResult, savedScore.id);
    }

    // 5. TELEMETRY
    await captureServerEvent("autopilot_scan_completed", {
      distinctId: user.id,
      company: finalCompany,
      grade: auditResult.overall_grade,
      archetype: auditResult.archetype
    });

    return NextResponse.json({
      success: true,
      audit: auditResult,
      scoreId: savedScore?.id,
      jobDetails: {
        title: finalTitle,
        company: finalCompany,
        url
      }
    });

  } catch (error) {
    console.error("[Auto-Pilot Route Error]", error);
    return NextResponse.json({ error: "Internal server error during Auto-Pilot sequence." }, { status: 500 });
  }
}
