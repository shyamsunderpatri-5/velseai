const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Groq } = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

async function testAll() {
  console.log("--- STARTING COMPREHENSIVE PROVIDER TEST ---");

  // 1. Test Groq
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  
  for (const m of groqModels) {
    try {
      process.stdout.write(`Testing Groq ${m}... `);
      const start = Date.now();
      await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'hi' }],
        model: m,
        max_tokens: 10
      });
      console.log(`✅ (${Date.now() - start}ms)`);
    } catch (e) {
      console.log(`❌ ${e.message.substring(0, 50)}...`);
    }
  }

  // 2. Test Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const geminiModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  
  for (const m of geminiModels) {
    try {
      process.stdout.write(`Testing Gemini ${m}... `);
      const start = Date.now();
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("hi");
      console.log(`✅ (${Date.now() - start}ms)`);
    } catch (e) {
      console.log(`❌ ${e.message.substring(0, 50)}...`);
    }
  }
}

testAll();
