import OpenAI from "openai";

let groqClient: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
}

/**
 * High-speed Llama 3 analysis via Groq
 */
export async function generateWithGroq(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" };
  }
): Promise<string> {
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: options?.model || "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: "You are an elite ATS auditor. Return the analysis in JSON format." 
      },
      { role: "user", content: prompt }
    ],
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 1024,
    response_format: options?.responseFormat,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}
