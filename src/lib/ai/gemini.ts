import { GoogleGenerativeAI } from "@google/generative-ai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * VelseAI — Google Gemini Integration v2 (SDK Based)
 * Highly reliable fallback for structured analysis.
 */

export async function generateWithGemini(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseMimeType?: "application/json" | "text/plain";
    triedModels?: string[];
  }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes("your_gemini_key_here")) {
    throw new Error("GEMINI_API_KEY is missing or invalid.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = options?.model || "gemini-2.0-flash";
  
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: options?.temperature ?? 0.2,
      maxOutputTokens: options?.maxTokens ?? 8192,
      responseMimeType: options?.responseMimeType ?? "text/plain",
    }
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text.trim();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    console.error("[Gemini Provider Error]", errorMsg);
    
    const isRateLimit = errorMsg.includes("429") || errorMsg.includes("quota");
    const isNotFound = errorMsg.includes("404") || errorMsg.includes("not found");

    if (isRateLimit) {
      console.warn(`[Gemini Quota] ${modelName} hit limit.`);
    }

    if (isNotFound) {
      console.error(`[Gemini Not Found] ${modelName} is not accessible on this account.`);
    }

    // Fail-fast: No more internal rotation. Let the Orchestrator switch providers.
    throw error;
  }
}

/**
 * Specifically for structured JSON output
 */
export async function generateStructuredWithGemini<T>(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<T> {
  let content = await generateWithGemini(prompt, {
    ...options,
    responseMimeType: "application/json"
  });

  // Clean markdown code blocks if present
  if (content.includes("```json")) {
    content = content.split("```json")[1].split("```")[0].trim();
  } else if (content.includes("```")) {
    content = content.split("```")[1].split("```")[0].trim();
  }

  try {
    // Detect truncation (Missing final closing bracket)
    const trimmed = content.trim();
    if (!trimmed.endsWith("}")) {
      console.warn("[Gemini Truncation Detected] Response cut off. Retrying...");
      return await generateStructuredWithGemini<T>(prompt, { ...options, model: "gemini-2.0-flash" });
    }
    
    return JSON.parse(content) as T;
  } catch (e) {
    console.error("[Gemini JSON Parse Error] Raw content:", content);
    
    // Final Ditch: Try Pro only if we didn't just fail it
    if (options?.model !== "gemini-2.0-flash") {
      return await generateStructuredWithGemini<T>(prompt, { ...options, model: "gemini-2.0-flash" });
    }
    
    throw new Error("Gemini returned invalid JSON.");
  }
}
