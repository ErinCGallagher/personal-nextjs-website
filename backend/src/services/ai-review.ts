/**
 * AI comment review service.
 * Uses Google Gemini to analyze comments for spam, toxicity, relevance, and safety.
 */

import { getGeminiClient } from "./gemini-client";
import { buildReviewPrompt } from "./ai-review-prompt";
import { AIReviewResponseSchema, AIReviewResponse } from "../schemas";
import { config } from "../config";
import {
  saveAIReview,
  markAIReviewError,
  approveComment,
  getCommentById,
} from "../db/ai-reviews";
import {
  sendAutoApprovedCommentNotification,
  sendPendingCommentNotification,
} from "../email";

const AI_REVIEW_TIMEOUT_MS = 10000;
const AI_REVIEW_TEMPERATURE = 0.1;

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

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new AIReviewTimeoutError()), AI_REVIEW_TIMEOUT_MS);
    });

    // Call Gemini API with timeout
    const apiPromise = client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: AI_REVIEW_TEMPERATURE, // Low temperature for more consistent, predictable responses
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

/**
 * Processes a comment review end-to-end: calls AI, saves results, auto-approves if applicable, and sends email.
 * This function is designed to be called asynchronously (fire-and-forget) after comment submission.
 *
 * @param commentId - The ID of the comment to review
 * @param commentText - The text content of the comment
 * @param postSlug - The slug of the blog post
 * @param notificationEmail - Email address to send notification to
 * @param userName - Name of the comment author
 * @param userEmail - Email of the comment author
 */
export async function processCommentReview(
  commentId: string,
  commentText: string,
  postSlug: string,
  notificationEmail: string,
  userName: string,
  userEmail: string
): Promise<void> {
  const provider = config.AI_REVIEW_PROVIDER;

  console.log(`[AI Review Process] Starting review for comment ${commentId}`);

  try {
    // Call AI review service
    const startTime = Date.now();
    const reviewResult = await reviewComment(commentText, postSlug);
    const responseTimeMs = Date.now() - startTime;

    // Save review results to database
    await saveAIReview(commentId, reviewResult, provider, responseTimeMs);

    console.log(
      `[AI Review Process] Review saved for comment ${commentId} - Confidence: ${reviewResult.confidenceScore}`
    );

    // Check if auto-approval should happen
    if (
      config.AI_AUTO_APPROVE_ENABLED &&
      reviewResult.confidenceScore >= config.AI_AUTO_APPROVE_THRESHOLD
    ) {
      await approveComment(commentId, "AI-AutoApprove");
      console.log(
        `[AI Review Process] Comment ${commentId} auto-approved with confidence ${reviewResult.confidenceScore}`
      );
    }

    // Fetch full comment with AI review data to determine email type
    const comment = await getCommentById(commentId);

    if (!comment) {
      console.error(
        `[AI Review Process] Comment ${commentId} not found after review`
      );
      return;
    }

    // Send appropriate email notification based on comment status
    if (!notificationEmail) {
      console.warn(
        `[AI Review Process] No notification email configured, skipping notification for comment ${commentId}`
      );
      return;
    }

    if (comment.status === "Approved") {
      await sendAutoApprovedCommentNotification({
        comment: {
          id: comment.id,
          post_slug: comment.post_slug,
          body: comment.body,
          user_name: comment.user_name || "Unknown User",
        },
        aiReview: {
          confidence_score: reviewResult.confidenceScore,
          flags: reviewResult.flags,
          reasoning: reviewResult.reasoning,
        },
        notificationEmail,
        userEmail,
      });
      console.log(
        `[AI Review Process] Auto-approval notification sent for comment ${commentId}`
      );
    } else {
      await sendPendingCommentNotification({
        comment: {
          id: comment.id,
          post_slug: comment.post_slug,
          body: comment.body,
          user_name: comment.user_name || "Unknown User",
        },
        aiReview: comment.latestAIReview
          ? {
              confidence_score: comment.latestAIReview.confidence_score,
              flags: comment.latestAIReview.flags,
              reasoning: comment.latestAIReview.reasoning,
            }
          : null,
        notificationEmail,
        userEmail,
      });
      console.log(
        `[AI Review Process] Pending review notification sent for comment ${commentId}`
      );
    }
  } catch (error) {
    // Mark review as failed in database
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    try {
      await markAIReviewError(commentId, errorMessage, provider);
      console.error(
        `[AI Review Process] Review failed for comment ${commentId}, error recorded:`,
        errorMessage
      );
    } catch (dbError) {
      console.error(
        `[AI Review Process] Failed to record error for comment ${commentId}:`,
        dbError
      );
    }

    // Fetch comment and send pending notification even if review failed
    if (notificationEmail) {
      try {
        const comment = await getCommentById(commentId);

        if (comment) {
          await sendPendingCommentNotification({
            comment: {
              id: comment.id,
              post_slug: comment.post_slug,
              body: comment.body,
              user_name: comment.user_name || "Unknown User",
            },
            aiReview: null, // No review data since it failed
            notificationEmail,
            userEmail,
          });
          console.log(
            `[AI Review Process] Pending notification sent for comment ${commentId} after review failure`
          );
        }
      } catch (notificationError) {
        console.error(
          `[AI Review Process] Failed to send notification for comment ${commentId}:`,
          notificationError
        );
      }
    }
  }
}
