/**
 * Admin routes for managing comments.
 * Authentication is handled by BetterAuth at /api/auth/*
 */
import { Router } from "express";
import { z } from "zod";
import pool from "../db";
import { getAllComments, updateCommentStatus } from "../db/comments";
import { requireAdmin, requireAdminOrFamily } from "../middleware/admin-auth";
import { validateRequest } from "../middleware/validate";
import { CommentStatus, TravelEntry } from "../models";

const router = Router();

// Authentication endpoints are now handled by BetterAuth:
// - POST /api/auth/sign-in/email
// - POST /api/auth/sign-out
// - GET /api/auth/get-session

const getCommentsSchema = z.object({
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
});

// GET /api/admin/comments?status=Pending
// Lists comments filtered by status (default: all)
// Includes AI review data (confidence score, flags, reasoning) via LEFT JOIN
router.get("/comments", requireAdmin, validateRequest(getCommentsSchema), async (req, res, next) => {
  try {
    const { status } = res.locals.validated as z.infer<typeof getCommentsSchema>;

    const comments = await getAllComments(status as CommentStatus | undefined);

    // Comments include latestAIReview field with AI review data (or null if no review)
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

const patchCommentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["Pending", "Approved", "Rejected"]),
});

// PATCH /api/admin/comments/:id
// Updates comment status (pending/approved/rejected)
router.patch("/comments/:id", requireAdmin, validateRequest(patchCommentSchema), async (req, res, next) => {
  try {
    const { id, status } = res.locals.validated as z.infer<typeof patchCommentSchema>;

    const updatedComment = await updateCommentStatus(
      id,
      status as CommentStatus,
      "admin"
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/travel
// Returns all travel itinerary entries from database
router.get("/travel", requireAdminOrFamily, async (req, res, next) => {
  try {
    const { rows } = await pool.query<TravelEntry>(
      `SELECT
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        country,
        city,
        hotel,
        flight,
        rental_car,
        notes
      FROM travel_itinerary
      ORDER BY date ASC`,
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
