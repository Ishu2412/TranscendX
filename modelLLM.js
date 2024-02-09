import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import { createCanvas, loadImage } from "canvas";

// Access your API key as an environment variable (see "Set up your API key" above)
env.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

//generating caption for the image
async function llmGenerator(prompt) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);
  return text;
}

//downloading images
async function downloadImage(
  url,
  localPath,
  rangeStart = 0,
  rangeEnd = undefined
) {
  const headers = {};

  if (rangeEnd !== undefined) {
    headers["Range"] = `bytes=${rangeStart}-${rangeEnd}`;
  }

  const response = await fetch(url, { headers });
  const imageBuffer = await response.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(imageBuffer));
}

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function textSolutionGenerator(url) {
  //image type
  const regex = /[^.]+$/;
  const type = url.match(regex)[0];

  //downloading image
  await downloadImage(url, `public/images/image.${type}`, 0, 712 * 712);

  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt =
    "describe the pose of the girl so others can pose exactly like that for photography. Give step by step instructions";

  const imageParts = [
    fileToGenerativePart("public/images/image1.png", "image/png"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();
  // console.log(text);
  return text;
}

// run(
//   "https://res.cloudinary.com/dvmk4d0kb/image/upload/v1706997833/olympic_flag.png"
// );

// captionGenerator(
//   [
//     "a child smiling at the camera",
//     "a child smiling at the camera",
//     "a child wearing a striped shirt",
//     "close up of a child's nose",
//     "a close up of an ear",
//     "a close up of a person's face",
//     "a close-up of a glass",
//     "a close up of an eye",
//     "a close up of a person's neck",
//     "a close-up of a blue and white striped shirt",
//   ],
//   "instagram"
// );

// run();

export { llmGenerator, textSolutionGenerator };
