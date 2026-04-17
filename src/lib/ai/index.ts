import { generateWithOllama, checkOllamaHealth } from "./ollama";
import { generateWithOpenAI, generateStructuredWithOpenAI } from "./openai";
import { generateWithGroq } from "./groq";
import { generateWithGemini, generateStructuredWithGemini } from "./gemini";

export { 
  generateWithOllama, 
  checkOllamaHealth, 
  generateWithOpenAI, 
  generateStructuredWithOpenAI, 
  generateWithGroq,
  generateWithGemini,
  generateStructuredWithGemini 
};

/**
 * VelseAI — AI Orchestration 2.5
 * 
 * Probabilistic Load Balancing + Intelligent Failover:
 * - 60% Groq (High Speed)
 * - 30% Gemini (High Reliability, Generous Free Tier)
 * - 10% OpenAI (Premium Fallback)
 * - Auto-detection of TPD (Wait a Day) vs TPM (Wait a Minute)
 */

// Track if Groq has hit daily limits to avoid wasting requests
let isGroqDailyLimitHit = false;
let lastGeminiLimitHit = 0; // Timestamp
let lastGroqLimitHit = 0; // Timestamp

const PROVIDER_WEIGHTS = {
  groq: 0.6,
  gemini: 0.3,
  openai: 0.1
};

function selectProvider(): "groq" | "gemini" | "openai" {
  const now = Date.now();
  const isGeminiCooling = now - lastGeminiLimitHit < 60000;
  const isGroqCooling = now - lastGroqLimitHit < 20000;

  if (isGroqDailyLimitHit || isGroqCooling) {
    if (isGeminiCooling) return "openai";
    return "gemini";
  }
  
  const rand = Math.random();
  if (rand < PROVIDER_WEIGHTS.groq) return "groq";
  if (rand < PROVIDER_WEIGHTS.groq + PROVIDER_WEIGHTS.gemini) return "gemini";
  return "openai";
}

export async function generateText(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    priority?: "speed" | "quality";
  }
): Promise<string> {
  const preferred = options?.priority === "quality" ? (isGroqDailyLimitHit ? "gemini" : "openai") : selectProvider();
  
  const providers = [];
  if (preferred === "groq") providers.push(generateWithGroq, generateWithGemini, generateWithOpenAI);
  else if (preferred === "gemini") providers.push(generateWithGemini, generateWithGroq, generateWithOpenAI);
  else providers.push(generateWithOpenAI, generateWithGemini, generateWithGroq);

  for (const providerFn of providers) {
    try {
      if (providerFn === generateWithGroq && (isGroqDailyLimitHit || !process.env.GROQ_API_KEY)) continue;
      if (providerFn === generateWithGemini && !process.env.GEMINI_API_KEY) continue;
      if (providerFn === generateWithOpenAI && (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("placeholder"))) continue;

      return await providerFn(prompt, options);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (providerFn === generateWithGroq && (errorMsg.includes("TPD") || errorMsg.includes("Daily limit"))) {
        isGroqDailyLimitHit = true;
        console.error("[AI Orchestrator] Groq Daily Limit hit. Switching to Gemini/OpenAI.");
      }
      console.warn(`[AI Orchestrator] Provider failed, attempting fallback...`, errorMsg);
    }
  }

  throw new Error("Critical: AI Provider Exhaustion. All systems offline.");
}

/**
 * Universal Structured JSON Generation v2.5
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  jsonSchema: any,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    priority?: "speed" | "quality";
  }
): Promise<T> {
  // Define the master chain of models to try in order
  const modelChain = [
    { provider: "groq", model: "llama-3.3-70b-versatile" },
    { provider: "groq", model: "llama-3.1-8b-instant" },
    { provider: "gemini", model: "gemini-2.0-flash" },
    { provider: "groq", model: "mixtral-8x7b-32768" },
  ];

  // If the user requested a specific model, prioritize it first (optional)
  if (options?.model) {
    modelChain.unshift({ provider: options.model.includes("gemini") ? "gemini" : "groq", model: options.model });
  }

  let lastError = null;

  for (const step of modelChain) {
    try {
      // Skip if API keys are missing
      if (step.provider === "groq" && !process.env.GROQ_API_KEY) continue;
      if (step.provider === "gemini" && !process.env.GEMINI_API_KEY) continue;
      if (step.provider === "openai" && (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("placeholder"))) continue;

      if (step.provider === "groq") {
        const content = await generateWithGroq(prompt, {
          ...options,
          model: step.model,
          responseFormat: { type: "json_object" }
        });
        return JSON.parse(content) as T;
      } 
      
      if (step.provider === "gemini") {
        return await generateStructuredWithGemini<T>(prompt, {
          ...options,
          model: step.model
        });
      }

      if (step.provider === "openai") {
        return await generateStructuredWithOpenAI<T>(prompt, jsonSchema, options);
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isDailyLimit = errorMsg.includes("TPD") || errorMsg.includes("Daily limit");
      if (isDailyLimit) isGroqDailyLimitHit = true;

      console.warn(`[AI Chain] ${step.model} failed. Trying next...`, errorMsg.substring(0, 50));
      lastError = error;
      
      // Wait a tiny bit between providers if rate limited to allow brief buffer
      if (errorMsg.includes("429")) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Final Ditch: 30s wait and try the highest-quota model (8B) one last time
  console.warn("[AI Chain] All models exhausted. Final stand: waiting 30s for quota reset...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  try {
    const content = await generateWithGroq(prompt, {
      ...options,
      model: "llama-3.1-8b-instant",
      responseFormat: { type: "json_object" }
    });
    return JSON.parse(content) as T;
  } catch (finalError) {
    throw new Error("No AI provider available. High traffic on free tiers. Please try again in 1 minute.");
  }
}
