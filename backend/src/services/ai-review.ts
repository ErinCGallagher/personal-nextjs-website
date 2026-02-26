/**
 * AI comment review service.
 * Uses Google Gemini to analyze comments for spam, toxicity, relevance, and safety.
 */

import { getGeminiClient } from "./gemini-client";
import { buildReviewPrompt } from "./ai-review-prompt";
import { AIReviewResponseSchema, AIReviewResponse } from "../schemas";

/**
 * Error thrown when AI review times out
 */
export class AIReviewTimeoutError extends Error {
  constructor() {
    super("AI review request timed out after 10 seconds");
    this.name = "AIReviewTimeoutError";
  }
}

/**
 * Error thrown when AI response cannot be parsed as JSON
 */
export class AIReviewInvalidResponseError extends Error {
  constructor(message: string) {
    super(`AI returned invalid JSON response: ${message}`);
    this.name = "AIReviewInvalidResponseError";
  }
}

/**
 * Error thrown when AI response fails schema validation
 */
export class AIReviewValidationError extends Error {
  constructor(message: string) {
    super(`AI response failed validation: ${message}`);
    this.name = "AIReviewValidationError";
  }
}

/**
 * Reviews a comment using AI to assess if it should be approved or rejected.
 *
 * @param commentText - The text content of the comment to review
 * @param postSlug - The slug of the blog post for context
 * @returns Promise resolving to AI review response with confidence score, flags, and reasoning
 * @throws {AIReviewTimeoutError} If the API request takes longer than 10 seconds
 * @throws {AIReviewInvalidResponseError} If the AI returns invalid JSON
 * @throws {AIReviewValidationError} If the response doesn't match expected schema
 * @throws {Error} For other API errors (rate limiting, network issues, etc.)
 */
export async function reviewComment(
  commentText: string,
  postSlug: string
): Promise<AIReviewResponse> {
  const startTime = Date.now();

  console.log(
    `[AI Review] Starting review for comment on post: ${postSlug} (${commentText.length} chars)`
  );

  try {
    const client = getGeminiClient();
    const prompt = buildReviewPrompt(commentText, postSlug);

    // Create timeout promise (10 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new AIReviewTimeoutError()), 10000);
    });

    // Call Gemini API with timeout
    const apiPromise = client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for more consistent, predictable responses
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
        responseMimeType: "application/json", // Request JSON response
      },
    });

    const result = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = result.text;

    if (!responseText) {
      throw new AIReviewInvalidResponseError("Empty response from Gemini API");
    }

    const duration = Date.now() - startTime;
    console.log(`[AI Review] Received response in ${duration}ms`);

    // Parse JSON response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      console.error(`[AI Review] Failed to parse JSON response:`, responseText);
      throw new AIReviewInvalidResponseError(
        error instanceof Error ? error.message : "Unknown parsing error"
      );
    }

    // Validate response against schema
    const validationResult = AIReviewResponseSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
      console.error(
        `[AI Review] Schema validation failed:`,
        validationResult.error.issues
      );
      throw new AIReviewValidationError(
        validationResult.error.issues.map((e: { message: string }) => e.message).join(", ")
      );
    }

    const reviewResult = validationResult.data;

    console.log(
      `[AI Review] Review complete - Confidence: ${reviewResult.confidenceScore}, Flags: [${reviewResult.flags.join(", ")}]`
    );

    return reviewResult;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Re-throw our custom errors as-is
    if (
      error instanceof AIReviewTimeoutError ||
      error instanceof AIReviewInvalidResponseError ||
      error instanceof AIReviewValidationError
    ) {
      console.error(`[AI Review] Error after ${duration}ms:`, error.message);
      throw error;
    }

    // Check for rate limiting
    if (error instanceof Error && error.message.includes("429")) {
      console.error(`[AI Review] Rate limited after ${duration}ms`);
      throw new Error("AI review service is rate limited. Please try again later.");
    }

    // Log and re-throw other errors
    console.error(
      `[AI Review] Unexpected error after ${duration}ms:`,
      error
    );
    throw error;
  }
}
