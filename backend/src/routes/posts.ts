// Express router for blog post endpoints.
// Handles retrieving like counts and toggling likes per post, identified by slug.
import { Router } from "express";
import { likesQuerySchema, likeBodySchema } from "../schemas";
import { ipLimiter, anonymousIdLimiter, readLimiter } from "../rate-limiters";
import { z } from "zod";
import pool from "../db";

const router = Router();

// GET /api/posts/:slug/likes?anonymous_id=xxx
// Returns the total like count and whether the given anonymous_id has liked the post
router.get("/:slug/likes", readLimiter, async (req, res) => {
  const result = likesQuerySchema.safeParse({
    slug: req.params.slug,
    anonymous_id: req.query.anonymous_id,
  });

  if (!result.success) {
    return res.status(400).json({ error: z.treeifyError(result.error) });
  }

  const { slug, anonymous_id } = result.data;

  const { rows } = await pool.query<{ count: string; liked: boolean }>(
    `SELECT
      COUNT(*) AS count,
      (COUNT(*) FILTER (WHERE anonymous_id = $2)) > 0 AS liked
    FROM post_likes
    WHERE post_slug = $1`,
    [slug, anonymous_id ?? null],
  );

  res.json({ count: parseInt(rows[0].count, 10), liked: rows[0].liked });
});

// POST /api/posts/:slug/like
// Toggles a like on a post — likes if not liked, unlikes if already liked
router.post("/:slug/like", ipLimiter, anonymousIdLimiter, async (req, res) => {
  const result = likeBodySchema.safeParse({
    slug: req.params.slug,
    anonymous_id: req.body.anonymous_id,
  });

  if (!result.success) {
    res.status(400).json({ error: z.treeifyError(result.error) });
    return;
  }

  const { slug, anonymous_id } = result.data;

  if (!anonymous_id) {
    res.status(400).json({ error: "anonymous_id is required" });
    return;
  }

  // Ensure the post record exists before inserting a like
  await pool.query(
    "INSERT INTO posts (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING",
    [slug],
  );

  const existing = await pool.query(
    "SELECT 1 FROM post_likes WHERE anonymous_id = $1 AND post_slug = $2",
    [anonymous_id, slug],
  );

  if (existing.rows.length > 0) {
    // Dislike
    await pool.query(
      "DELETE FROM post_likes WHERE anonymous_id = $1 AND post_slug = $2",
      [anonymous_id, slug],
    );
  } else {
    await pool.query(
      // Like
      "INSERT INTO post_likes (anonymous_id, post_slug) VALUES ($1, $2)",
      [anonymous_id, slug],
    );
  }

  // get incremented or decremented like count
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM post_likes WHERE post_slug = $1",
    [slug],
  );

  res.json({
    liked: existing.rows.length === 0,
    count: parseInt(rows[0].count, 10),
  });
});

export default router;
