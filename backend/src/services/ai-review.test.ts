/**
 * Integration tests for AI comment review and auto-approval system.
 * Tests the complete flow from comment submission through AI review to auto-approval.
 */

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import pool from "../db";

const ANON_ID = "550e8400-e29b-41d4-a716-446655440010";

// Mock email functions
vi.mock("../email", () => ({
  sendNewCommentNotification: vi.fn().mockResolvedValue(undefined),
  sendPendingCommentNotification: vi.fn().mockResolvedValue(undefined),
  sendAutoApprovedCommentNotification: vi.fn().mockResolvedValue(undefined),
}));

// Mock the Gemini client to prevent real API calls
vi.mock("./gemini-client", () => ({
  getGeminiClient: vi.fn(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          confidenceScore: 0.95,
          flags: [],
          reasoning: "Test response",
        }),
      }),
    },
  })),
}));

// Import app AFTER mocking
const app = (await import("../index")).default;
const { getGeminiClient } = await import("./gemini-client");

// Helper function to create a test post and user
async function setupTestData() {
  await pool.query(
    `INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3)
     ON CONFLICT (anonymous_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email`,
    [ANON_ID, "Test User", "test@example.com"]
  );
  await pool.query(
    `INSERT INTO posts (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`,
    ["ai-review-test-post"]
  );
}

// Helper to wait for async AI review to complete
async function waitForAIReview(commentId: string, maxAttempts = 30) {
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

// Helper to set mock Gemini response
function setMockGeminiResponse(response: { confidenceScore: number; flags: string[]; reasoning: string }) {
  vi.mocked(getGeminiClient).mockReturnValue({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify(response),
      }),
    },
  } as any);
}

// Helper to set mock Gemini error
function setMockGeminiError(error: Error) {
  vi.mocked(getGeminiClient).mockReturnValue({
    models: {
      generateContent: vi.fn().mockRejectedValue(error),
    },
  } as any);
}

describe("AI Review Integration Tests", () => {
  beforeEach(async () => {
    await setupTestData();
    vi.clearAllMocks();
  });

  describe("High Confidence Auto-Approval", () => {
    it("should auto-approve comment with confidence score >= 0.95", async () => {
      setMockGeminiResponse({
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

      await waitForAIReview(commentId);

      const commentResult = await pool.query(
        "SELECT status, status_updated_by FROM comments WHERE id = $1",
        [commentId]
      );

      expect(commentResult.rows[0].status).toBe("Approved");
      expect(commentResult.rows[0].status_updated_by).toBe("AI-AutoApprove");

      const reviewResult = await pool.query(
        `SELECT * FROM ai_comment_reviews WHERE comment_id = $1`,
        [commentId]
      );

      expect(reviewResult.rows).toHaveLength(1);
      expect(Number(reviewResult.rows[0].confidence_score)).toBe(0.95);
      expect(reviewResult.rows[0].status).toBe("completed");
      expect(reviewResult.rows[0].provider).toBe("gemini");
    });

    it("should send auto-approved email notification", async () => {
      const { sendAutoApprovedCommentNotification } = await import("../email");

      setMockGeminiResponse({
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
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(sendAutoApprovedCommentNotification).toHaveBeenCalled();
    });
  });

  describe("Low Confidence Pending Review", () => {
    it("should keep comment pending with confidence score 0.60", async () => {
      setMockGeminiResponse({
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
      await waitForAIReview(res.body.id);

      const commentResult = await pool.query(
        "SELECT status FROM comments WHERE id = $1",
        [res.body.id]
      );

      expect(commentResult.rows[0].status).toBe("Pending");
    });

    it("should send pending review email notification", async () => {
      const { sendPendingCommentNotification } = await import("../email");

      setMockGeminiResponse({
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
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(sendPendingCommentNotification).toHaveBeenCalled();
    });
  });

  describe("Threshold Boundary Tests", () => {
    it("should auto-approve comment with confidence exactly 0.9 (at threshold)", async () => {
      setMockGeminiResponse({
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
    });

    it("should keep pending comment with confidence 0.89 (just below threshold)", async () => {
      setMockGeminiResponse({
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
    });
  });

  describe("Error Handling", () => {
    it("should handle AI review errors gracefully", async () => {
      setMockGeminiError(new Error("AI review request timed out after 10 seconds"));

      const res = await request(app)
        .post("/api/posts/ai-review-test-post/comment")
        .send({
          anonymous_id: ANON_ID,
          name: "Test User",
          email: "test@example.com",
          body: "Test comment.",
        });

      expect(res.status).toBe(201);
      await waitForAIReview(res.body.id);

      const commentResult = await pool.query(
        "SELECT status FROM comments WHERE id = $1",
        [res.body.id]
      );
      expect(commentResult.rows[0].status).toBe("Pending");

      const reviewResult = await pool.query(
        `SELECT status FROM ai_comment_reviews WHERE comment_id = $1`,
        [res.body.id]
      );

      expect(reviewResult.rows[0].status).toBe("error");
    });

    it("should send pending notification even when AI review fails", async () => {
      const { sendPendingCommentNotification } = await import("../email");

      setMockGeminiError(new Error("API rate limit exceeded"));

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
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(sendPendingCommentNotification).toHaveBeenCalled();
    });
  });

  describe("Database Persistence", () => {
    it("should correctly save all AI review fields to database", async () => {
      setMockGeminiResponse({
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
      expect(Number(review.confidence_score)).toBe(0.85);
      expect(review.flags).toEqual(["spam", "toxic"]);
      expect(review.reasoning).toBe(
        "Contains promotional language and aggressive tone."
      );
      expect(review.status).toBe("completed");
      expect(review.api_response_time_ms).toBeGreaterThanOrEqual(0);
      expect(review.reviewed_at).toBeTruthy();
    });

    it("should update comment.latest_ai_review_id to point to review", async () => {
      setMockGeminiResponse({
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

      const reviewResult = await pool.query(
        `SELECT id FROM ai_comment_reviews WHERE id = $1`,
        [reviewId]
      );

      expect(reviewResult.rows).toHaveLength(1);
    });
  });
});
