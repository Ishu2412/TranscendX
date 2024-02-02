import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import env from "dotenv";

env.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function run(path, type) {
  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt =
    "Extract information from image as a photographer for photography purpose";

  //   const imageParts = [fileToGenerativePart(path, `image/${type}`)];
  // const path =
  const imageParts = [fileToGenerativePart(path, `image/jpeg`)];

  //("image.jpeg", "image/jpeg") and png

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();
  console.log(text);
}

export { run };
