import { generateStructuredJSON } from "./index";
import { z } from "zod";
import { scoreResume } from "../ats/scorer"; // For regex fallback

/**
 * Career-Ops Zero-Token Scraper Logic
 * Hits Greenhouse, Lever, and Ashby APIs directly.
 */
export async function scrapeJobDescription(url: string): Promise<{
  title: string;
  company: string;
  description: string;
  location?: string;
} | null> {
  try {
    // 1. Greenhouse
    const greenhouseMatch = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)\/jobs\/(\d+)/);
    if (greenhouseMatch) {
      const board = greenhouseMatch[1];
      const jobId = greenhouseMatch[2];
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          company: data.offices?.[0]?.name || "Unknown",
          description: data.content, // HTML content
          location: data.location?.name
        };
      }
    }

    // 2. Ashby
    const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)\/([^/?#]+)/);
    if (ashbyMatch) {
      const company = ashbyMatch[1];
      const jobId = ashbyMatch[2];
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${company}/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          company: data.companyName,
          description: data.descriptionHtml,
          location: data.location
        };
      }
    }

    // 3. Lever
    const leverMatch = url.match(/jobs\.lever\.co\/([^/?#]+)\/([^/?#]+)/);
    if (leverMatch) {
      const company = leverMatch[1];
      const jobId = leverMatch[2];
      const res = await fetch(`https://api.lever.co/v0/postings/${company}/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.text,
          company: company,
          description: data.descriptionHtml + data.lists.map((l: any) => `<h3>${l.text}</h3><ul>${l.content}</ul>`).join(""),
          location: data.categories?.location
        };
      }
    }

    return null; // Not a supported API URL
  } catch (error) {
    console.error("[Scraper] Zero-token fetch failed:", error);
    return null;
  }
}


const SenioritySchema = z.object({
  candidate_years: z.number().describe("Total years of experience found in the resume"),
  jd_required: z.object({
    min: z.number().describe("Minimum years of experience required by the JD"),
    max: z.number().describe("Maximum years of experience allowed by the JD (if range). If only '5+ years' is mentioned, max should be 99.")
  }),
  is_match: z.boolean().describe("Whether the candidate is within a reasonable range for this role"),
  reason: z.string().describe("A 1-sentence explanation of the seniority fit (e.g., 'Candidate has 6 years for a 2-8 year role')")
});

export type SeniorityData = z.infer<typeof SenioritySchema>;

/**
 * Hardened Micro-AI Extractor for Dynamic Seniority Validation
 */
export async function extractSeniorityFit(
  resumeText: string,
  jobDescription: string
): Promise<SeniorityData> {
  const prompt = `### ROLE: Seniority Intelligence Auditor
### TASK: Extract and validate years of experience fit between Resume and JD.

RESUME:
${resumeText.slice(0, 3000)}

JD:
${jobDescription.slice(0, 5000)}

### LOGICAL RULES:
1. If JD is "2-8 years" and Resume is "12 years" -> is_match: FALSE (Too Senior).
2. If JD is "2-8 years" and Resume is "1 year" -> is_match: FALSE (Too Junior).
3. If JD is "2-8 years" and Resume is "6 years" -> is_match: TRUE (Perfect).
4. If JD is "5+ years", treat max as 99.

### OUTPUT FORMAT (JSON ONLY):
{
  "candidate_years": number,
  "jd_required": { "min": number, "max": number },
  "is_match": boolean,
  "reason": "Expert explanation"
}`;

  try {
    const aiResult = await generateStructuredJSON<SeniorityData>(
      prompt,
      // Pass raw JSON schema for strict structure enforcement
      {
        type: "object",
        properties: {
          candidate_years: { type: "number" },
          jd_required: {
            type: "object",
            properties: {
              min: { type: "number" },
              max: { type: "number" }
            },
            required: ["min", "max"]
          },
          is_match: { type: "boolean" },
          reason: { type: "string" }
        },
        required: ["candidate_years", "jd_required", "is_match", "reason"]
      },
      { temperature: 0 }
    );

    // 🛡️ MANUAL CODE-GATE (Safety Layer)
    // Even if AI is "too nice", the code enforces the founder's logic.
    const { candidate_years: found, jd_required: req } = aiResult;
    
    // Allow a small 1-year grace buffer for flexibility
    const isStrictlyMatch = found >= (req.min - 0.5) && found <= (req.max + 1);
    
    if (!isStrictlyMatch) {
      return {
        ...aiResult,
        is_match: false,
        reason: `Seniority Conflict: Role requires ${req.min}-${req.max} years, but profile shows ${found} years. Eligibility check failed.`
      };
    }

    return aiResult;
  } catch (error) {
    console.warn("Seniority Micro-AI failed, falling back to Regex Pass:", error);
    
    // ELITE FALLBACK: Use the deterministic regex engine we hardened earlier
    const algoResult = scoreResume(resumeText, jobDescription);
    const found = algoResult.experience_years_found || 0;
    const req = algoResult.experience_years_required || 0;
    
    // Use the same Wall logic as the engine
    const isGated = (req <= 3 && found >= 8) || (req >= 10 && found <= 3);

    return {
      candidate_years: found,
      jd_required: { min: req, max: req + 3 }, // Assume +3 range for fallback
      is_match: !isGated,
      reason: isGated ? "Deterministic mismatch detected via regex pass." : "Fallback match via structural pass."
    };
  }
}
