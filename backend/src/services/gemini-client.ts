/**
 * Google Gemini AI client for comment review.
 * Provides a configured Gemini model instance and health check functionality.
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

/**
 * Initialize the Gemini API client
 * @throws {Error} If GEMINI_API_KEY environment variable is not set
 */
function initializeGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is required but not set. " +
        "Please add it to your .env file. Get your API key from: https://aistudio.google.com/app/apikey"
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Configured Gemini 1.5 Flash model instance for comment review.
 * This model is fast and efficient for content moderation tasks.
 */
let geminiModel: GenerativeModel | null = null;

export function getGeminiModel(): GenerativeModel {
  if (!geminiModel) {
    const genAI = initializeGeminiClient();
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return geminiModel;
}

/**
 * Health check function to verify Gemini API connectivity.
 * Sends a simple test request to ensure the API key is valid and the service is available.
 *
 * @returns Promise that resolves to true if API is accessible, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();

    // If we get any response back, the API is working
    return text.length > 0;
  } catch (error) {
    console.error("Gemini API health check failed:", error);
    return false;
  }
}
