import { generateWithGroq } from "@/lib/ai/groq";
import { zodToJsonSchema } from "@/lib/ai/structured-outputs";
import { ExtractedResume, CoverLetterSchema, GeneratedCoverLetter } from "./schemas";
import { COUNTRY_FORMATS, CountryFormatId } from "./country-formats";

interface CoverLetterParams {
  extractedUserData: ExtractedResume;
  jobDescription: string;
  companyName: string;
  targetCountry: CountryFormatId;
  tone: "professional" | "enthusiastic" | "formal";
}

export async function generateCoverLetter(params: CoverLetterParams): Promise<GeneratedCoverLetter> {
  const jsonSchema = zodToJsonSchema(CoverLetterSchema);
  const countryRules = COUNTRY_FORMATS[params.targetCountry];

  const prompt = `### ROLE
You are an Elite Executive Career Coach specializing in modern, high-converting Cover Letters.

### MISSION
Write a 250-400 word highly compelling cover letter that bridges the candidate's existing experience directly to the provided Job Description.

### PARAMETERS
- TONE: ${params.tone.toUpperCase()}
- TARGET REGION: ${countryRules.label}. Ensure spelling, formality, and date formats align with this region.
- COMPANY: ${params.companyName || "Hiring Company"}

### STRICT RULES
1. DECEPTION OFFENSE: NEVER invent fake experience.
2. NO ROBOTIC LANGUAGE: Avoid overly generic AI phrases like "I am writing to express my profound interest..." Make it punchy, human, and direct.
3. JD ALIGNMENT: Naturally inject core keywords from the Job Description into the body paragraphs seamlessly.
4. STRUCTURE: You MUST return a JSON object exactly matching the provided Schema.

### CANDIDATE DATA
${JSON.stringify(params.extractedUserData, null, 2)}

### TARGET JOB DESCRIPTION
${params.jobDescription}

### OUTPUT JSON SCHEMA REQUIREMENTS
${JSON.stringify(jsonSchema, null, 2)}
`;

  try {
    const rawResponse = await generateWithGroq(prompt, {
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Slightly creative for natural prose
      maxTokens: 2000,
      responseFormat: { type: "json_object" },
    });

    const parsedJson = JSON.parse(rawResponse);
    const validatedData = CoverLetterSchema.parse(parsedJson);

    return validatedData;
  } catch (error) {
    console.error("Cover Letter Generation Error:", error);
    throw new Error("Failed to generate cover letter. Please verify input data.");
  }
}
