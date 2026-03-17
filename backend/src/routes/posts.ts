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
import { validateRequest } from "../middleware/validate";
import { sendNewCommentNotification } from "../email";
import { config } from "../config";
import { processCommentReview } from "../services/ai-review";
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
router.get("/:slug/likes", readLimiter, validateRequest(likesQuerySchema), async (req, res, next) => {
  try {
    const { slug, anonymous_id } = res.locals.validated as z.infer<typeof likesQuerySchema>;

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
  validateRequest(likeBodySchema),
  async (req, res, next) => {
    try {
      const { slug, anonymous_id } = res.locals.validated as z.infer<typeof likeBodySchema>;

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
router.get("/:slug/comments", readLimiter, validateRequest(commentsQuerySchema), async (req, res, next) => {
  try {
    const { slug } = res.locals.validated as z.infer<typeof commentsQuerySchema>;

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
router.post("/:slug/comment", readLimiter, validateRequest(commentBodySchema), async (req, res, next) => {
  try {
    const { slug, anonymous_id, name, email, body } = res.locals.validated as z.infer<typeof commentBodySchema>;

    await ensurePostExists(slug);
    await upsertUser(anonymous_id, name, email);

    const comment = await createComment(slug, anonymous_id, body);

    // Determine notification email
    const notificationEmail = process.env.NOTIFICATION_EMAIL;

    if (config.AI_REVIEW_ENABLED && notificationEmail) {
      // Trigger AI review asynchronously (fire-and-forget)
      // The review process will auto-approve if confidence is high and send appropriate email
      Promise.resolve()
        .then(async () => {
          await processCommentReview(
            comment.id,
            body,
            slug,
            notificationEmail,
            name,
            email
          );
        })
        .catch((error) => {
          console.error(
            "AI review process failed for comment",
            comment.id,
            ":",
            error
          );
        });
    } else {
      // Fallback to immediate email notification if AI review is disabled
      sendNewCommentNotification({
        postSlug: slug,
        commentBody: body,
        userName: name,
        userEmail: email,
      }).catch((error) => {
        console.error("Failed to send comment notification email:", error);
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

export default router;
