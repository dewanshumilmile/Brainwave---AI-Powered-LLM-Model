// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Describe or answer questions about an image using Gemini Vision.
 * imageBase64: base64-encoded image data (no data: prefix)
 * mimeType: "image/jpeg" | "image/png" | "image/webp"
 */
export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "[Gemini Vision not configured. Add GEMINI_API_KEY to .env.local]";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Free tier

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
        },
      },
      prompt,
    ]);

    return result.response.text();
  } catch (err) {
    console.error("Gemini Vision error:", err);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
