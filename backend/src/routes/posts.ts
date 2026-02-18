// Express router for blog post endpoints.
// Handles retrieving like counts and toggling likes per post, identified by slug.
import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/posts/:slug/likes
// Returns the total like count for a post
router.get('/:slug/likes', async (req, res) => {
  const { slug } = req.params;

  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM post_likes WHERE post_slug = $1',
    [slug]
  );

  res.json({ count: parseInt(rows[0].count, 10) });
});

// POST /api/posts/:slug/like
// Toggles a like on a post — likes if not liked, unlikes if already liked
router.post('/:slug/like', async (req, res) => {
  const { slug } = req.params;
  const { anonymous_id } = req.body;

  if (!anonymous_id) {
    res.status(400).json({ error: 'anonymous_id is required' });
    return;
  }

  // Ensure the post record exists before inserting a like
  await pool.query(
    'INSERT INTO posts (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING',
    [slug]
  );

  const existing = await pool.query(
    'SELECT 1 FROM post_likes WHERE anonymous_id = $1 AND post_slug = $2',
    [anonymous_id, slug]
  );

  if (existing.rows.length > 0) { // Dislike
    await pool.query(
      'DELETE FROM post_likes WHERE anonymous_id = $1 AND post_slug = $2',
      [anonymous_id, slug]
    );
  } else {
    await pool.query( // Like
      'INSERT INTO post_likes (anonymous_id, post_slug) VALUES ($1, $2)',
      [anonymous_id, slug]
    );
  }

  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM post_likes WHERE post_slug = $1',
    [slug]
  );

  res.json({
    liked: existing.rows.length === 0,
    count: parseInt(rows[0].count, 10),
  });
});

export default router;
