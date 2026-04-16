import { generateWithOllama, checkOllamaHealth } from "./ollama";
import { generateWithOpenAI, generateStructuredWithOpenAI } from "./openai";
import { generateWithGroq } from "./groq";

export { generateWithOllama, checkOllamaHealth, generateWithOpenAI, generateStructuredWithOpenAI, generateWithGroq };

/**
 * VelseAI — AI Orchestration 2.0
 * 
 * Probabilistic Load Balancing Logic:
 * - 80% Groq (High Speed, Free/Cheap tier)
 * - 20% OpenAI (High Reliability)
 * - Auto-fallback on any timeout or rate limit
 */

const PROVIDER_WEIGHTS = {
  groq: 0.8,
  openai: 0.2
};

function selectProvider(): "groq" | "openai" {
  const rand = Math.random();
  return rand < PROVIDER_WEIGHTS.groq ? "groq" : "openai";
}

export async function generateText(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    priority?: "speed" | "quality";
  }
): Promise<string> {
  const preferred = options?.priority === "quality" ? "openai" : selectProvider();
  
  const providers = preferred === "groq" 
    ? [generateWithGroq, generateWithOpenAI] 
    : [generateWithOpenAI, generateWithGroq];

  for (const providerFn of providers) {
    try {
      if (providerFn === generateWithGroq && !process.env.GROQ_API_KEY) continue;
      if (providerFn === generateWithOpenAI && !process.env.OPENAI_API_KEY) continue;

      return await providerFn(prompt, options);
    } catch (error) {
      console.warn(`[AI Orchestrator] Provider failed, attempting fallback...`, error);
    }
  }

  throw new Error("Critical: AI Provider Exhaustion. All systems offline.");
}

/**
 * Universal Structured JSON Generation v2.0
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  jsonSchema: any,
  options?: {
    model?: string;
    temperature?: number;
    priority?: "speed" | "quality";
  }
): Promise<T> {
  const preferred = options?.priority === "quality" ? "openai" : selectProvider();

  // 1. Attempt preferred provider
  if (preferred === "groq" && process.env.GROQ_API_KEY) {
    try {
      const content = await generateWithGroq(prompt, {
        ...options,
        responseFormat: { type: "json_object" }
      });
      return JSON.parse(content) as T;
    } catch (error) {
      console.warn("[AI Orchestrator] Groq JSON failed, falling back to OpenAI.");
    }
  }

  // 2. OpenAI Fallback (or Primary if preferred)
  if (process.env.OPENAI_API_KEY) {
    try {
      const { generateStructuredWithOpenAI } = await import("./openai");
      return await generateStructuredWithOpenAI<T>(prompt, jsonSchema, options);
    } catch (error) {
      console.error("[AI Orchestrator] OpenAI JSON failed.");
      // Last ditch: if OpenAI was preferred, try Groq
      if (preferred === "openai" && process.env.GROQ_API_KEY) {
        const content = await generateWithGroq(prompt, {
          ...options,
          responseFormat: { type: "json_object" }
        });
        return JSON.parse(content) as T;
      }
    }
  }

  throw new Error("No AI provider available for structured data.");
}
