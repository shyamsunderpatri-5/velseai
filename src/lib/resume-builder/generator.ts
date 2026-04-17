import { generateStructuredJSON } from "@/lib/ai";
import { zodToJsonSchema } from "@/lib/ai/structured-outputs";
import { ExtractedResumeSchema, ExtractedResume, GeneratedResume } from "./schemas";
import { COUNTRY_FORMATS, CountryFormatId } from "./country-formats";

interface GenerateParams {
  extractedUserData: ExtractedResume;
  jobDescription: string;
  missingKeywords: string[];
  targetCountry: CountryFormatId;
  templateStyle?: string;
  targetAtsScore?: number;
}

export async function generateOptimizedResume(params: GenerateParams): Promise<GeneratedResume> {
  const jsonSchema = zodToJsonSchema(ExtractedResumeSchema);
  const countryRules = COUNTRY_FORMATS[params.targetCountry];

  const prompt = `### ROLE
You are an Elite Career Strategist and ATS (Applicant Tracking System) Specialist. Your task is to rewrite the provided candidate data to achieve a ${params.targetAtsScore || 95}%+ ATS match against the provided Job Description, adhering strictly to regional formatting rules.

### STRICT GENERATION RULES
1. DECEPTION OFFENSE: NEVER invent fake experience, projects, or jobs.
2. SKILL OFFENSE: NEVER add hard capabilities or programming languages the user does not demonstrably possess.
3. ACTION VERBS: DO rewrite bullet points to begin with strong action verbs (e.g., Engineered, Orchestrated, Spearheaded).
4. KEYWORD INJECTION: DO naturally inject the provided 'Missing Keywords' into the existing experience safely. If a keyword cannot be reasonably justified by their past experience, omit it.
5. QUANTIFICATION: DO quantify achievements where possible safely (e.g., estimating generic values safely like 'improved efficiency by ~15%').
6. SKILL REORDERING: DO reorder the 'technical' skills array so that skills mentioned in the JD appear first.
7. TAILORED SUMMARY: DO entirely rewrite the professional summary/objective to directly align with the JD opening statement.
8. COUNTRY RULES: DO strictly follow the regional guidelines provided below.
${params.templateStyle ? `9. AESTHETIC DIRECTIVE: Ensure bullet length and verbosity fits a "${params.templateStyle}" template architecture.` : ''}
10. OUTPUT: MUST output precise JSON matching the exact Schema Structure.

### REGIONAL RULES FOR: ${countryRules.label}
- Resume Protocol Title: ${countryRules.title}
- DO NOT INCLUDE: ${Object.entries(countryRules.rules).filter(([_, v]) => v === "forbidden").map(([k]) => k).join(", ")}
- GUIDELINES: ${countryRules.guidelines.join(" ")}

### TARGET JOB DESCRIPTION
${params.jobDescription}

### SPECIFIC MISSING ATS KEYWORDS TO INJECT
${params.missingKeywords.join(", ")}

### ORIGINAL EXTRACTED USER DATA
${JSON.stringify(params.extractedUserData, null, 2)}

### OUTPUT JSON SCHEMA REQUIREMENTS
${JSON.stringify(jsonSchema, null, 2)}
`;

  try {
    const validatedData = await generateStructuredJSON<GeneratedResume>(prompt, jsonSchema, {
      temperature: 0.3,
      maxTokens: 6000,
      priority: "speed" // Use Groq for speed, fail over to OpenAI for reliability
    });

    return validatedData;
  } catch (error) {
    console.error("Resume Generation Error:", error);
    throw new Error("Failed to generate highly optimized resume. Please verify input data.");
  }
}
