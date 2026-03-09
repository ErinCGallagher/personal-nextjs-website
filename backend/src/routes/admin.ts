/**
 * Admin routes for managing comments.
 * Authentication is handled by BetterAuth at /api/auth/*
 */
import { Router } from "express";
import { z } from "zod";
import pool from "../db";
import { requireAdmin } from "../middleware/admin-auth";
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
             c.created_at, c.status_updated_at, c.status_updated_by,
             u.name as user_name, u.email
      FROM comments c
      JOIN users u ON c.user_id = u.anonymous_id
    `;

    const params: string[] = [];

    if (status) {
      query += " WHERE c.status = $1";
      params.push(status);
    }

    query += " ORDER BY c.created_at DESC";

    const { rows } = await pool.query<
      CommentRow & { email: string }
    >(query, params);

    res.json(rows);
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
router.get("/travel", requireAdmin, async (req, res, next) => {
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
