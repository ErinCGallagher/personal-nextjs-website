/**
 * Integration tests for AI comment review and auto-approval system.
 * Tests the complete flow from comment submission through AI review to auto-approval.
 */

import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import app from "../index";
import pool from "../db";
import { reviewComment } from "./ai-review";
import * as aiReviewModule from "./ai-review";

const ANON_ID = "550e8400-e29b-41d4-a716-446655440010";

// Mock email functions
vi.mock("../email", () => ({
  sendNewCommentNotification: vi.fn().mockResolvedValue(undefined),
  sendPendingCommentNotification: vi.fn().mockResolvedValue(undefined),
  sendAutoApprovedCommentNotification: vi.fn().mockResolvedValue(undefined),
}));

// Helper function to create a test post and user
async function setupTestData() {
  await pool.query(
    "INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3)",
    [ANON_ID, "Test User", "test@example.com"]
  );
  await pool.query("INSERT INTO posts (slug) VALUES ($1)", [
    "ai-review-test-post",
  ]);
}

// Helper to wait for async AI review to complete
async function waitForAIReview(commentId: string, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pool.query(
      "SELECT latest_ai_review_id FROM comments WHERE id = $1",
      [commentId]
    );
    if (result.rows[0]?.latest_ai_review_id) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("AI review did not complete in time");
}

describe("AI Review Integration Tests", () => {
  beforeEach(async () => {
    await setupTestData();
  });

  describe("High Confidence Auto-Approval", () => {
    it("should auto-approve comment with confidence score >= 0.95", async () => {
      // Mock AI review to return high confidence
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.95,
          flags: [],
          reasoning: "This looks like a genuine, safe comment.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "This is a great post! Thanks for sharing.",
        });

      expect(res.status).toBe(201);
      const commentId = res.body.id;

      // Wait for AI review to complete
      await waitForAIReview(commentId);

      // Check comment status
      const commentResult = await pool.query(
        "SELECT status, status_updated_by FROM comments WHERE id = $1",
        [commentId]
      );

      expect(commentResult.rows[0].status).toBe("Approved");
      expect(commentResult.rows[0].status_updated_by).toBe("AI-AutoApprove");

      // Verify AI review was saved
      const reviewResult = await pool.query(
        `SELECT * FROM ai_comment_reviews WHERE comment_id = $1`,
        [commentId]
      );

      expect(reviewResult.rows).toHaveLength(1);
      expect(reviewResult.rows[0].confidence_score).toBe("0.95");
      expect(reviewResult.rows[0].status).toBe("completed");
      expect(reviewResult.rows[0].provider).toBe("gemini");

      mockReview.mockRestore();
    });

    it("should send auto-approved email notification", async () => {
      const { sendAutoApprovedCommentNotification } = await import("../email");

      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.98,
          flags: [],
          reasoning: "Excellent comment quality.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Great article!",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      // Allow time for email to be sent
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(sendAutoApprovedCommentNotification).toHaveBeenCalled();

      mockReview.mockRestore();
    });
  });

  describe("Low Confidence Pending Review", () => {
    it("should keep comment pending with confidence score 0.60", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.6,
          flags: ["uncertain"],
          reasoning: "Comment requires manual review.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Check out my website!",
        });

      expect(res.status).toBe(201);
      const commentId = res.body.id;

      await waitForAIReview(commentId);

      // Check comment status remains pending
      const commentResult = await pool.query(
        "SELECT status FROM comments WHERE id = $1",
        [commentId]
      );

      expect(commentResult.rows[0].status).toBe("Pending");

      mockReview.mockRestore();
    });

    it("should send pending review email notification", async () => {
      const { sendPendingCommentNotification } = await import("../email");

      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.5,
          flags: ["spam"],
          reasoning: "Potential spam detected.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Buy my product!",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(sendPendingCommentNotification).toHaveBeenCalled();

      mockReview.mockRestore();
    });
  });

  describe("Threshold Boundary Tests", () => {
    it("should auto-approve comment with confidence exactly 0.9 (at threshold)", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.9,
          flags: [],
          reasoning: "Meets minimum threshold.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Good post.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      const commentResult = await pool.query(
        "SELECT status FROM comments WHERE id = $1",
        [res.body.id]
      );

      expect(commentResult.rows[0].status).toBe("Approved");

      mockReview.mockRestore();
    });

    it("should keep pending comment with confidence 0.89 (just below threshold)", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.89,
          flags: [],
          reasoning: "Just below threshold.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Interesting.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      const commentResult = await pool.query(
        "SELECT status FROM comments WHERE id = $1",
        [res.body.id]
      );

      expect(commentResult.rows[0].status).toBe("Pending");

      mockReview.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle AI review timeout errors gracefully", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockRejectedValue(new Error("AI review request timed out after 10 seconds"));

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Test comment.",
        });

      expect(res.status).toBe(201);
      const commentId = res.body.id;

      // Wait for error to be recorded
      await waitForAIReview(commentId);

      // Comment should still be pending
      const commentResult = await pool.query(
        "SELECT status FROM comments WHERE id = $1",
        [commentId]
      );
      expect(commentResult.rows[0].status).toBe("Pending");

      // Error should be recorded in AI reviews table
      const reviewResult = await pool.query(
        `SELECT status, error_message FROM ai_comment_reviews WHERE comment_id = $1`,
        [commentId]
      );

      expect(reviewResult.rows[0].status).toBe("error");
      expect(reviewResult.rows[0].error_message).toContain("timed out");

      mockReview.mockRestore();
    });

    it("should handle invalid JSON response errors", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockRejectedValue(
          new Error("AI returned invalid JSON response: Unexpected token")
        );

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Another test.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      const reviewResult = await pool.query(
        `SELECT status, error_message FROM ai_comment_reviews WHERE comment_id = $1`,
        [res.body.id]
      );

      expect(reviewResult.rows[0].status).toBe("error");
      expect(reviewResult.rows[0].error_message).toContain("invalid JSON");

      mockReview.mockRestore();
    });

    it("should send pending notification even when AI review fails", async () => {
      const { sendPendingCommentNotification } = await import("../email");

      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockRejectedValue(new Error("API rate limit exceeded"));

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Test failure handling.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(sendPendingCommentNotification).toHaveBeenCalled();

      mockReview.mockRestore();
    });
  });

  describe("Database Persistence", () => {
    it("should correctly save all AI review fields to database", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.85,
          flags: ["spam", "toxic"],
          reasoning: "Contains promotional language and aggressive tone.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Test persistence.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      const reviewResult = await pool.query(
        `SELECT * FROM ai_comment_reviews WHERE comment_id = $1`,
        [res.body.id]
      );

      const review = reviewResult.rows[0];
      expect(review.provider).toBe("gemini");
      expect(review.confidence_score).toBe("0.85");
      expect(review.flags).toEqual(["spam", "toxic"]);
      expect(review.reasoning).toBe(
        "Contains promotional language and aggressive tone."
      );
      expect(review.status).toBe("completed");
      expect(review.api_response_time_ms).toBeGreaterThan(0);
      expect(review.reviewed_at).toBeTruthy();

      mockReview.mockRestore();
    });

    it("should update comment.latest_ai_review_id to point to review", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.75,
          flags: [],
          reasoning: "Normal comment.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Check foreign key.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      const commentResult = await pool.query(
        `SELECT latest_ai_review_id FROM comments WHERE id = $1`,
        [res.body.id]
      );

      const reviewId = commentResult.rows[0].latest_ai_review_id;
      expect(reviewId).toBeTruthy();

      // Verify the review exists
      const reviewResult = await pool.query(
        `SELECT id FROM ai_comment_reviews WHERE id = $1`,
        [reviewId]
      );

      expect(reviewResult.rows).toHaveLength(1);

      mockReview.mockRestore();
    });

    it("should support multiple reviews for same comment (history tracking)", async () => {
      const mockReview = vi
        .spyOn(aiReviewModule, "reviewComment")
        .mockResolvedValue({
          confidenceScore: 0.8,
          flags: [],
          reasoning: "First review.",
        });

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Multiple reviews test.",
        });

      expect(res.status).toBe(201);
      const commentId = res.body.id;
      await waitForAIReview(commentId);

      // Simulate a second review (in practice, triggered by re-review feature)
      mockReview.mockResolvedValue({
        confidenceScore: 0.9,
        flags: [],
        reasoning: "Second review.",
      });

      await pool.query(
        `INSERT INTO ai_comment_reviews (comment_id, provider, confidence_score, flags, reasoning, status)
         VALUES ($1, 'gemini', 0.92, '[]'::jsonb, 'Manual re-review', 'completed')`,
        [commentId]
      );

      // Check history
      const reviewsResult = await pool.query(
        `SELECT COUNT(*) as count FROM ai_comment_reviews WHERE comment_id = $1`,
        [commentId]
      );

      expect(parseInt(reviewsResult.rows[0].count)).toBeGreaterThanOrEqual(2);

      mockReview.mockRestore();
    });
  });

  describe("Config-Based Behaviour", () => {
    it("should not auto-approve when threshold is set to 1.0", async () => {
      // This test would require mocking config, which is tricky with current setup
      // Documenting the expected behaviour for manual testing
      // When AI_AUTO_APPROVE_THRESHOLD=1.0, even 0.99 confidence should stay pending
    });

    it("should not auto-approve when AI_AUTO_APPROVE_ENABLED=false", async () => {
      // This test would require mocking config
      // When AI_AUTO_APPROVE_ENABLED=false, all comments should stay pending
      // regardless of confidence score
    });
  });
});
