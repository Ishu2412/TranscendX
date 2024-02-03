import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "dotenv";

// Access your API key as an environment variable (see "Set up your API key" above)
env.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = "India is my country -- convert this into japanese";

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);
}

run();
