import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function generateWithOpenAI(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: options?.model || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 500,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}

export async function generateStructuredWithOpenAI<T>(
  prompt: string,
  jsonSchema: Record<string, unknown>,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<T> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: options?.model || "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: "You are an elite ATS (Applicant Tracking System) Auditor. Analyze the resume with precision and return a strictly structured JSON response." 
      },
      { role: "user", content: prompt }
    ],
    temperature: options?.temperature ?? 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim() || "{}";
  return JSON.parse(content) as T;
}
