/**
 * Google Gemini AI client for comment review.
 * Provides a configured Gemini model instance and health check functionality.
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Initialize the Gemini API client
 * @throws {Error} If GEMINI_API_KEY environment variable is not set
 */
function initializeGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is required but not set. " +
        "Please add it to your .env file. Get your API key from: https://aistudio.google.com/app/apikey"
    );
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Configured Gemini client instance.
 */
let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = initializeGeminiClient();
  }
  return geminiClient;
}

/**
 * Health check function to verify Gemini API connectivity.
 * Sends a simple test request to ensure the API key is valid and the service is available.
 *
 * @returns Promise that resolves to true if API is accessible, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getGeminiClient();
    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });

    // If we get any response back, the API is working
    return result.text.length > 0;
  } catch (error) {
    console.error("Gemini API health check failed:", error);
    return false;
  }
}
