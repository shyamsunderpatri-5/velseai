import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the SDK easily accessible without a client sometimes
    // But we can try to fetch them via REST using the key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
