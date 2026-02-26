/**
 * Admin routes for managing comments.
 * Authentication is handled by BetterAuth at /api/auth/*
 */
import { Router } from "express";
import { z } from "zod";
import pool from "../db";
import { requireAdmin, requireAdminOrFamily } from "../middleware/admin-auth";
import { CommentRow, CommentStatus, TravelEntry } from "../models";

const router = Router();

// Authentication endpoints are now handled by BetterAuth:
// - POST /api/auth/sign-in/email
// - POST /api/auth/sign-out
// - GET /api/auth/get-session

// GET /api/admin/comments?status=Pending
// Lists comments filtered by status (default: all)
router.get("/comments", requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      status: z
        .enum(["Pending", "Approved", "Rejected"])
        .optional(),
    });

    const result = schema.safeParse({
      status: req.query.status,
    });

    if (!result.success) {
      return res.status(400).json({ error: z.treeifyError(result.error) });
    }

    const { status } = result.data;

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

    if (status) {
      query += " WHERE c.status = $1";
      params.push(status);
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
        ai_status: string | null;
        ai_error_message: string | null;
        ai_reviewed_at: Date | null;
        ai_api_response_time_ms: number | null;
      }
    >(query, params);

    // Map rows to include nested AI review data
    const mappedRows = rows.map((row) => {
      const latestAIReview = row.ai_id
        ? {
            id: row.ai_id,
            provider: row.ai_provider!,
            confidence_score: row.ai_confidence_score,
            flags: row.ai_flags as string[] | null,
            reasoning: row.ai_reasoning,
            status: row.ai_status,
            error_message: row.ai_error_message,
            reviewed_at: row.ai_reviewed_at,
            api_response_time_ms: row.ai_api_response_time_ms,
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
        latest_ai_review_id: row.latest_ai_review_id,
        user_name: row.user_name,
        email: row.email,
        latestAIReview: latestAIReview,
      };
    });

    res.json(mappedRows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/comments/:id
// Updates comment status (pending/approved/rejected)
router.patch("/comments/:id", requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      id: z.string().uuid(),
      status: z.enum(["Pending", "Approved", "Rejected"]),
    });

    const result = schema.safeParse({
      id: req.params.id,
      status: req.body.status,
    });

    if (!result.success) {
      return res.status(400).json({ error: z.treeifyError(result.error) });
    }

    const { id, status } = result.data;

    const { rows } = await pool.query<CommentRow>(
      `UPDATE comments
       SET status = $1,
           status_updated_at = now(),
           status_updated_by = 'admin'
       WHERE id = $2
       RETURNING id, post_slug, parent_id, user_id, body, status, created_at, status_updated_at, status_updated_by`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(rows[0]);
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
