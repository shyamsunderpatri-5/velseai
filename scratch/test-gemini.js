const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-2.0-flash",
    "gemini-pro"
  ];

  console.log("--- STARTING GEMINI MODEL TEST ---");
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi, are you working?");
      const response = await result.response;
      console.log(`  ✅ ${modelName}: SUCCESS`);
    } catch (error) {
      console.error(`  ❌ ${modelName}: FAIL - ${error.message}`);
    }
  }
}

testModels();
