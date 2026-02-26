/**
 * Express router for blog post endpoints.
 * Handles retrieving like counts and toggling likes per post, identified by slug.
 */
import { Router } from "express";
import { createHash } from "crypto";
import {
  likesQuerySchema,
  likeBodySchema,
  commentsQuerySchema,
  commentBodySchema,
} from "../schemas";
import { ipLimiter, anonymousIdLimiter, readLimiter } from "../rate-limiters";
import { z } from "zod";
import { sendNewCommentNotification } from "../email";
import {
  getLikeStats,
  ensurePostExists,
  hasUserLikedPost,
  addLike,
  removeLike,
  getLikeCount,
} from "../db/likes";
import {
  getApprovedCommentCount,
  getApprovedComments,
  upsertUser,
  createComment,
} from "../db/comments";

const router = Router();

// GET /api/posts/:slug/likes?anonymous_id=xxx
// Returns the total like count, comment count and whether the given anonymous_id has liked the post
router.get("/:slug/likes", readLimiter, async (req, res, next) => {
  try {
    const result = likesQuerySchema.safeParse({
      slug: req.params.slug,
      anonymous_id: req.query.anonymous_id,
    });

    if (!result.success) {
      return res.status(400).json({ error: z.treeifyError(result.error) });
    }

    const { slug, anonymous_id } = result.data;

    const likeStats = await getLikeStats(slug, anonymous_id);
    const commentCount = await getApprovedCommentCount(slug);

    res.json({
      likeCount: likeStats.count,
      liked: likeStats.liked,
      commentCount: commentCount,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:slug/like
// Toggles a like on a post — likes if not liked, unlikes if already liked
router.post(
  "/:slug/like",
  ipLimiter,
  anonymousIdLimiter,
  async (req, res, next) => {
    try {
      const result = likeBodySchema.safeParse({
        slug: req.params.slug,
        anonymous_id: req.body.anonymous_id,
      });

      if (!result.success) {
        res.status(400).json({ error: z.treeifyError(result.error) });
        return;
      }

      const { slug, anonymous_id } = result.data;

      await ensurePostExists(slug);

      const alreadyLiked = await hasUserLikedPost(anonymous_id, slug);

      if (alreadyLiked) {
        await removeLike(anonymous_id, slug);
      } else {
        await addLike(anonymous_id, slug);
      }

      const count = await getLikeCount(slug);

      res.json({
        liked: !alreadyLiked,
        count: count,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/posts/:slug/comments
// Returns all approved comments for a post
router.get("/:slug/comments", readLimiter, async (req, res, next) => {
  try {
    const result = commentsQuerySchema.safeParse({
      slug: req.params.slug,
    });

    if (!result.success) {
      return res.status(400).json({ error: z.treeifyError(result.error) });
    }

    const { slug } = result.data;

    const comments = await getApprovedComments(slug);

    // Hash user_id with post_slug for privacy (prevents cross-post tracking)
    const hashedComments = comments.map((comment) => ({
      ...comment,
      user_id: createHash("sha256")
        .update(comment.user_id + comment.post_slug)
        .digest("hex"),
    }));

    res.json(hashedComments);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:slug/comment
// Create a comment for a post
router.post("/:slug/comment", readLimiter, async (req, res, next) => {
  try {
    const result = commentBodySchema.safeParse({
      slug: req.params.slug,
      anonymous_id: req.body.anonymous_id,
      name: req.body.name,
      email: req.body.email,
      body: req.body.body,
    });

    if (!result.success) {
      return res.status(400).json({ error: z.treeifyError(result.error) });
    }

    const { slug, anonymous_id, name, email, body } = result.data;

    await ensurePostExists(slug);
    await upsertUser(anonymous_id, name, email);

    const comment = await createComment(slug, anonymous_id, body);

    // Send email notification asynchronously
    sendNewCommentNotification({
      postSlug: slug,
      commentBody: body,
      userName: name,
      userEmail: email,
    }).catch((error) => {
      console.error("Failed to send comment notification email:", error);
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

export default router;
