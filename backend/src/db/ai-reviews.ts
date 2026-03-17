/**
 * Database functions for AI comment review operations.
 * Handles saving, retrieving, and managing AI review data.
 */

import pool from "../db";
import { AICommentReview, AIReviewStatus, CommentRow } from "../models";
import { AIReviewResponse } from "../schemas";

/**
 * Saves an AI review result to the database.
 * Inserts a new row in ai_comment_reviews and updates the comment's latest_ai_review_id.
 * Uses a transaction to ensure both operations succeed or fail together.
 */
export async function saveAIReview(
  commentId: string,
  review: AIReviewResponse,
  provider: string,
  responseTimeMs: number
): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert new review record
    const reviewResult = await client.query<{ id: string }>(
      `INSERT INTO ai_comment_reviews
       (comment_id, provider, confidence_score, flags, reasoning, status, api_response_time_ms)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6)
       RETURNING id`,
      [
        commentId,
        provider,
        review.confidenceScore,
        JSON.stringify(review.flags),
        review.reasoning,
        responseTimeMs,
      ]
    );

    const reviewId = reviewResult.rows[0].id;

    // Update comment to point to this review
    await client.query(
      `UPDATE comments SET latest_ai_review_id = $1 WHERE id = $2`,
      [reviewId, commentId]
    );

    await client.query("COMMIT");
    return reviewId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Marks an AI review as failed by inserting an error record.
 * Updates the comment's latest_ai_review_id to point to this error record.
 * Uses a transaction to ensure both operations succeed or fail together.
 */
export async function markAIReviewError(
  commentId: string,
  errorMessage: string,
  provider: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert error review record
    const reviewResult = await client.query<{ id: string }>(
      `INSERT INTO ai_comment_reviews
       (comment_id, provider, status, error_message)
       VALUES ($1, $2, 'error', $3)
       RETURNING id`,
      [commentId, provider, errorMessage]
    );

    const reviewId = reviewResult.rows[0].id;

    // Update comment to point to this error record
    await client.query(
      `UPDATE comments SET latest_ai_review_id = $1 WHERE id = $2`,
      [reviewId, commentId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Approves a comment by updating its status.
 * Used for both AI auto-approval (approvedBy="AI-AutoApprove") and manual admin approval.
 */
export async function approveComment(
  commentId: string,
  approvedBy: string
): Promise<void> {
  await pool.query(
    `UPDATE comments
     SET status = 'Approved',
         status_updated_at = NOW(),
         status_updated_by = $1
     WHERE id = $2`,
    [approvedBy, commentId]
  );
}

/**
 * Retrieves all AI review history for a comment, ordered by most recent first.
 * Useful for tracking multiple reviews over time.
 */
export async function getAIReviewHistory(
  commentId: string
): Promise<AICommentReview[]> {
  const result = await pool.query<AICommentReview>(
    `SELECT id, comment_id, provider, confidence_score, flags, reasoning,
            status, error_message, reviewed_at, api_response_time_ms, created_at
     FROM ai_comment_reviews
     WHERE comment_id = $1
     ORDER BY created_at DESC`,
    [commentId]
  );

  return result.rows.map((row) => ({
    ...row,
    flags: row.flags as unknown as string[] | null,
  }));
}

/**
 * Retrieves a single comment by ID with its latest AI review data.
 * Returns null if comment not found.
 */
export async function getCommentById(
  commentId: string
): Promise<CommentRow | null> {
  const result = await pool.query<CommentRow & {
    ai_id: string | null;
    ai_comment_id: string | null;
    ai_provider: string | null;
    ai_confidence_score: number | null;
    ai_flags: unknown | null;
    ai_reasoning: string | null;
    ai_status: AIReviewStatus | null;
    ai_error_message: string | null;
    ai_reviewed_at: Date | null;
    ai_api_response_time_ms: number | null;
    ai_created_at: Date | null;
  }>(
    `SELECT c.id, c.post_slug, c.parent_id, c.user_id, c.body, c.status,
            c.created_at, c.status_updated_at, c.status_updated_by, c.latest_ai_review_id,
            u.name as user_name,
            ar.id as ai_id, ar.comment_id as ai_comment_id, ar.provider as ai_provider,
            ar.confidence_score as ai_confidence_score, ar.flags as ai_flags,
            ar.reasoning as ai_reasoning, ar.status as ai_status,
            ar.error_message as ai_error_message, ar.reviewed_at as ai_reviewed_at,
            ar.api_response_time_ms as ai_api_response_time_ms, ar.created_at as ai_created_at
     FROM comments c
     JOIN users u ON c.user_id = u.anonymous_id
     LEFT JOIN ai_comment_reviews ar ON c.latest_ai_review_id = ar.id
     WHERE c.id = $1`,
    [commentId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  // Build latestAIReview object if AI review exists
  const latestAIReview: AICommentReview | null = row.ai_id
    ? {
        id: row.ai_id,
        comment_id: row.ai_comment_id!,
        provider: row.ai_provider!,
        confidence_score: row.ai_confidence_score,
        flags: row.ai_flags as string[] | null,
        reasoning: row.ai_reasoning,
        status: row.ai_status as AIReviewStatus,
        error_message: row.ai_error_message,
        reviewed_at: row.ai_reviewed_at,
        api_response_time_ms: row.ai_api_response_time_ms,
        created_at: row.ai_created_at!,
      }
    : null;

  return {
    id: row.id,
    post_slug: row.post_slug,
    parent_id: row.parent_id,
    user_id: row.user_id,
    body: row.body,
    status: row.status,
    created_at: row.created_at,
    status_updated_at: row.status_updated_at,
    status_updated_by: row.status_updated_by,
    user_name: row.user_name,
    latest_ai_review_id: row.latest_ai_review_id,
    latestAIReview: latestAIReview,
  };
}
