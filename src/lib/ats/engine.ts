import { scoreResume, ATSResult as DeterministicResult } from "./scorer";
import { generateStructuredJSON } from "../ai";
import { extractSeniorityFit } from "../ai/extractor";
import { getATSImprovementPrompt } from "../ai/prompts";
import { ATSScoreResultSchema, ATSScoreResult } from "../ai/structured-outputs";

/**
 * Unified ATS Intelligence Engine
 * 
 * Orchestrates:
 * 1. High-speed Algorithmic Pass (Keywords, Integrity)
 * 2. AI-Native Seniority Gate (Extracts dynamic ranges e.g. 2-8 yrs)
 * 3. Deep Semantic Pass (Only if Eligible)
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  locale: string = "en"
): Promise<Omit<ATSScoreResult, 'suggestions'> & { 
  suggestions: {
    high_priority: string[];
    medium_priority: string[];
    low_priority: string[];
  };
  matched_keywords: string[]; 
  missing_keywords: string[]; 
  processingTime: number;
  match_level?: string;
  reasons?: Array<{ factor: string; impact: string; detail: string }>;
  seniority_analysis: string;
  readability_analysis: string;
  impact_score: number;
}> {
  const startTime = Date.now();

  // ── Step 1: Algorithmic Pass (Fast Extraction) ───────────────────────────
  const algoResult = scoreResume(resumeText, jobDescription);

  // ── Step 2: Semantic Seniority Analysis (with Fail-Safe) ─────────────────
  let seniorityAnalysis = "Analysis pending manual review.";
  try {
    const seniorityFit = await extractSeniorityFit(resumeText, jobDescription);
    seniorityAnalysis = seniorityFit.reason;
  } catch (error) {
    console.warn("Seniority AI pass failed, using fallback message:", error);
  }

  // ── Step 3: Semantic Pass (AI-Powered Deep Audit) ────────────────────────
  let aiResult: Partial<ATSScoreResult> | null = null;
  const hasAIKeys = !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);

  // Deep Audit always proceeds per user request (Gate skipped)
  if (hasAIKeys) {
    try {
      const prompt = getATSImprovementPrompt({ 
        resumeText, 
        jobDescription, 
        missingKeywords: algoResult.missing_keywords,
        locale 
      });

      aiResult = await generateStructuredJSON<ATSScoreResult>(
        prompt,
        {}, 
        { temperature: 0.1 }
      );
    } catch (error) {
      console.warn("AI Semantic pass failed, using algorithmic fallback:", error);
    }
  }

  // ── Step 4: Intelligence Merging ────────────────────────────────────────
  let finalOverallScore = algoResult.overall_score;
  
  if (aiResult?.overall_score) {
    // 60/40 weighted blend between deterministic and semantic scoring
    finalOverallScore = Math.round((algoResult.overall_score * 0.6) + (aiResult.overall_score * 0.4));
  }
  
  // Guard: Clamp to [0, 100] for mathematical safety
  finalOverallScore = Math.min(100, Math.max(0, finalOverallScore));

  // Merge suggestions for elite output
  const rawSuggestions = [
    ...(aiResult?.suggestions?.map(s => s.message) || []),
    ...algoResult.suggestions.high_priority,
    ...algoResult.suggestions.medium_priority,
  ];
  
  // Deduplicate to ensure zero advice-looping
  const mergedSuggestions = [...new Set(rawSuggestions)];

  const processingTime = Date.now() - startTime;

  return {
    ...algoResult,
    overall_score: finalOverallScore,
    suggestions: {
      high_priority: mergedSuggestions.slice(0, 3),
      medium_priority: mergedSuggestions.slice(3, 7),
      low_priority: mergedSuggestions.slice(7, 10),
    },
    summary: aiResult?.summary || "Structural analysis complete. See suggestions below for optimization.",
    match_level: finalOverallScore >= 85 ? "excellent" : finalOverallScore >= 70 ? "good" : finalOverallScore >= 40 ? "fair" : "poor",
    seniority_analysis: seniorityAnalysis,
    readability_analysis: algoResult.readability_analysis,
    impact_score: algoResult.impact_score,
    reasons: aiResult?.suggestions?.map(s => ({
      factor: s.category,
      impact: s.priority === "high" ? "negative" : "positive",
      detail: s.message
    })),
    keyword_frames: aiResult?.keyword_frames,
    processingTime
  };
}
