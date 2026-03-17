/**
 * Database functions for comment operations.
 * Handles creating, retrieving, and updating comments.
 */

import pool from "../db";
import { AIReviewStatus, CommentRow, CommentStatus } from "../models";

/**
 * Gets the count of approved comments for a post.
 */
export async function getApprovedCommentCount(postSlug: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count
     FROM comments
     WHERE post_slug = $1 AND status = $2`,
    [postSlug, CommentStatus.Approved]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Gets all approved comments for a post, including user information.
 * Used for public comment display.
 */
export async function getApprovedComments(postSlug: string): Promise<CommentRow[]> {
  const { rows } = await pool.query<CommentRow>(
    `SELECT c.id, c.post_slug, c.parent_id, c.user_id, c.body, c.status, c.created_at, c.status_updated_at, c.status_updated_by, u.name as user_name
     FROM comments c
     JOIN users u ON c.user_id = u.anonymous_id
     WHERE c.post_slug = $1 AND c.status = $2
     ORDER BY c.created_at ASC`,
    [postSlug, CommentStatus.Approved]
  );
  return rows;
}

/**
 * Creates or updates a user record.
 * Uses UPSERT to update name and email if user already exists.
 */
export async function upsertUser(
  anonymousId: string,
  name: string,
  email: string
): Promise<void> {
  await pool.query(
    `INSERT INTO users (anonymous_id, name, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (anonymous_id)
     DO UPDATE SET
       name = EXCLUDED.name,
       email = EXCLUDED.email`,
    [anonymousId, name, email]
  );
}

/**
 * Creates a new comment for a post.
 * Returns the newly created comment record.
 */
export async function createComment(
  postSlug: string,
  userId: string,
  body: string
): Promise<CommentRow> {
  const { rows } = await pool.query<CommentRow>(
    `INSERT INTO comments (post_slug, user_id, body, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, post_slug, parent_id, user_id, body, status, created_at, status_updated_at, status_updated_by`,
    [postSlug, userId, body, CommentStatus.Pending]
  );
  return rows[0];
}

export interface CommentWithAIReview extends Omit<CommentRow, "latestAIReview"> {
  email: string;
  latestAIReview: {
    id: string;
    provider: string;
    confidence_score: number | null;
    flags: string[] | null;
    reasoning: string | null;
    status: AIReviewStatus;
    error_message: string | null;
    reviewed_at: Date | null;
    api_response_time_ms: number | null;
  } | null;
}

/**
 * Gets all comments with optional status filter.
 * Includes user information and AI review data.
 * Used for admin panel.
 */
export async function getAllComments(
  statusFilter?: CommentStatus
): Promise<CommentWithAIReview[]> {
  let query = `
    SELECT c.id, c.post_slug, c.parent_id, c.user_id, c.body, c.status,
           c.created_at, c.status_updated_at, c.status_updated_by, c.latest_ai_review_id,
           u.name as user_name, u.email,
           ar.id as ai_id, ar.provider as ai_provider,
           ar.confidence_score as ai_confidence_score, ar.flags as ai_flags,
           ar.reasoning as ai_reasoning, ar.status as ai_status,
           ar.error_message as ai_error_message, ar.reviewed_at as ai_reviewed_at,
           ar.api_response_time_ms as ai_api_response_time_ms
    FROM comments c
    JOIN users u ON c.user_id = u.anonymous_id
    LEFT JOIN ai_comment_reviews ar ON c.latest_ai_review_id = ar.id
  `;

  const params: string[] = [];

  if (statusFilter) {
    query += " WHERE c.status = $1";
    params.push(statusFilter);
  }

  query += " ORDER BY c.created_at DESC";

  const { rows } = await pool.query<
    CommentRow & {
      email: string;
      ai_id: string | null;
      ai_provider: string | null;
      ai_confidence_score: number | null;
      ai_flags: unknown | null;
      ai_reasoning: string | null;
      ai_status: AIReviewStatus | null;
      ai_error_message: string | null;
      ai_reviewed_at: Date | null;
      ai_api_response_time_ms: number | null;
    }
  >(query, params);

  return rows.map((row) => {
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
      latest_ai_review_id: row.latest_ai_review_id,
      user_name: row.user_name,
      email: row.email,
      latestAIReview: row.ai_id ? {
        id: row.ai_id,
        provider: row.ai_provider!,
        confidence_score: row.ai_confidence_score,
        flags: row.ai_flags as string[] | null,
        reasoning: row.ai_reasoning,
        status: row.ai_status as AIReviewStatus,
        error_message: row.ai_error_message,
        reviewed_at: row.ai_reviewed_at,
        api_response_time_ms: row.ai_api_response_time_ms,
      } : null,
    };
  });
}

/**
 * Updates a comment's status.
 * Used for admin moderation (approve/reject).
 */
export async function updateCommentStatus(
  commentId: string,
  status: CommentStatus,
  updatedBy: string
): Promise<CommentRow | null> {
  const { rows } = await pool.query<CommentRow>(
    `UPDATE comments
     SET status = $1,
         status_updated_at = now(),
         status_updated_by = $2
     WHERE id = $3
     RETURNING id, post_slug, parent_id, user_id, body, status, created_at, status_updated_at, status_updated_by`,
    [status, updatedBy, commentId]
  );

  return rows.length > 0 ? rows[0] : null;
}
