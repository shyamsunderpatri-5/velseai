import { generateWithOllama, checkOllamaHealth } from "./ollama";
import { generateWithOpenAI } from "./openai";

export async function generateText(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const ollamaAvailable = await checkOllamaHealth();

  if (ollamaAvailable) {
    try {
      return await generateWithOllama(prompt, options);
    } catch (error) {
      console.warn("Ollama failed, falling back to OpenAI:", error);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    return await generateWithOpenAI(prompt, options);
  }

  throw new Error("No AI provider available. Please set up Ollama or OpenAI.");
}
