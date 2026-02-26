/**
 * Database functions for post like operations.
 * Handles retrieving and toggling likes for blog posts.
 */

import pool from "../db";

/**
 * Gets the like count and whether a specific user has liked the post.
 */
export async function getLikeStats(
  postSlug: string,
  anonymousId?: string
): Promise<{ count: number; liked: boolean }> {
  const { rows } = await pool.query<{ count: string; liked: boolean }>(
    `SELECT
      COUNT(*) AS count,
      (COUNT(*) FILTER (WHERE anonymous_id = $2)) > 0 AS liked
    FROM post_likes
    WHERE post_slug = $1`,
    [postSlug, anonymousId ?? null]
  );

  return {
    count: parseInt(rows[0].count, 10),
    liked: rows[0].liked,
  };
}

/**
 * Ensures a post record exists in the posts table.
 * Creates it if it doesn't exist (for lazy initialization).
 */
export async function ensurePostExists(postSlug: string): Promise<void> {
  await pool.query(
    "INSERT INTO posts (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING",
    [postSlug]
  );
}

/**
 * Checks if a user has already liked a post.
 */
export async function hasUserLikedPost(
  anonymousId: string,
  postSlug: string
): Promise<boolean> {
  const result = await pool.query(
    "SELECT 1 FROM post_likes WHERE anonymous_id = $1 AND post_slug = $2",
    [anonymousId, postSlug]
  );
  return result.rows.length > 0;
}

/**
 * Adds a like to a post.
 */
export async function addLike(
  anonymousId: string,
  postSlug: string
): Promise<void> {
  await pool.query(
    "INSERT INTO post_likes (anonymous_id, post_slug) VALUES ($1, $2)",
    [anonymousId, postSlug]
  );
}

/**
 * Removes a like from a post.
 */
export async function removeLike(
  anonymousId: string,
  postSlug: string
): Promise<void> {
  await pool.query(
    "DELETE FROM post_likes WHERE anonymous_id = $1 AND post_slug = $2",
    [anonymousId, postSlug]
  );
}

/**
 * Gets the total like count for a post.
 */
export async function getLikeCount(postSlug: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM post_likes WHERE post_slug = $1",
    [postSlug]
  );
  return parseInt(rows[0].count, 10);
}
