import { generateStructuredJSON } from "../ai";
import { getNeuralAuditPrompt } from "../ai/prompts";

export interface AuditDimension {
  name: string;
  score: number;
  grade: string;
  pros: string[];
  cons: string[];
}

export interface NeuralAuditResult {
  overall_grade: "A" | "B" | "C" | "D" | "F";
  overall_score: number; // 0.0 - 5.0
  archetype: string;
  legitimacy_tier: "High Confidence" | "Proceed with Caution" | "Suspicious";
  dimensions: AuditDimension[];
  strategic_advice: string;
  red_flags: string[];
  interview_master_stories: {
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    reflection: string;
    themes: string[];
  }[];
}

/**
 * Neural Audit Engine v2.0
 * 10-Dimension Holistic Career Audit
 */
export async function performNeuralAudit(params: {
  resumeText: string;
  jobDescription: string;
  companyInfo?: string;
  locale?: string;
}): Promise<NeuralAuditResult> {
  const { resumeText, jobDescription, companyInfo, locale = "en" } = params;

  const prompt = getNeuralAuditPrompt({
    resumeText,
    jobDescription,
    companyInfo,
    locale,
  });

  // Strict JSON Schema for the 10 dimensions
  const schema = {
    type: "object",
    properties: {
      overall_grade: { enum: ["A", "B", "C", "D", "F"] },
      overall_score: { type: "number" },
      archetype: { type: "string" },
      legitimacy_tier: { enum: ["High Confidence", "Proceed with Caution", "Suspicious"] },
      dimensions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            score: { type: "number" },
            grade: { type: "string" },
            pros: { type: "array", items: { type: "string" } },
            cons: { type: "array", items: { type: "string" } }
          },
          required: ["name", "score", "grade", "pros", "cons"]
        }
      },
      strategic_advice: { type: "string" },
      red_flags: { type: "array", items: { type: "string" } },
      interview_master_stories: { type: "array", items: { type: "string" } }
    },
    required: ["overall_grade", "overall_score", "archetype", "legitimacy_tier", "dimensions", "strategic_advice", "red_flags", "interview_master_stories"]
  };

  try {
    return await generateStructuredJSON<NeuralAuditResult>(prompt, schema, {
      priority: "quality", // Use GPT-4o for deep reasoning
      temperature: 0.2
    });
  } catch (error) {
    console.error("[Auditor] Neural Audit failed:", error);
    throw new Error("Neural Audit logic fault. Failed to synthesize opportunity intelligence.");
  }
}
