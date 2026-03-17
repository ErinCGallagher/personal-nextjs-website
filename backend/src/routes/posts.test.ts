import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "../index";

const ANON_ID = "550e8400-e29b-41d4-a716-446655440001";

// Mock the email module to prevent actual emails during tests
vi.mock("../email", () => ({
  sendNewCommentNotification: vi.fn().mockResolvedValue(undefined),
  sendPendingCommentNotification: vi.fn().mockResolvedValue(undefined),
  sendAutoApprovedCommentNotification: vi.fn().mockResolvedValue(undefined),
}));

// Mock the Gemini client to prevent real API calls during AI review.
// Low confidence score (below 0.9 threshold) keeps comments in Pending status,
// which is what most tests expect.
vi.mock("../services/gemini-client", () => ({
  getGeminiClient: vi.fn(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          confidenceScore: 0.5,
          flags: [],
          reasoning: "Test response",
        }),
      }),
    },
  })),
}));

describe("GET /api/posts/:slug/likes", () => {
  it("returns count 0 and liked false when no likes exist", async () => {
    const res = await request(app).get("/api/posts/cape-town-itinerary/likes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      likeCount: 0,
      commentCount: 0,
      liked: false,
    });
  });

  it("returns liked false when anonymous_id has not liked the post", async () => {
    await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    const OTHER_ID = "550e8400-e29b-41d4-a716-446655440002";
    const res = await request(app).get(
      `/api/posts/cape-town-itinerary/likes?anonymous_id=${OTHER_ID}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      likeCount: 1,
      commentCount: 0,
      liked: false,
    });
  });

  it("returns liked true when anonymous_id has liked the post", async () => {
    await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    const res = await request(app).get(
      `/api/posts/cape-town-itinerary/likes?anonymous_id=${ANON_ID}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      likeCount: 1,
      commentCount: 0,
      liked: true,
    });
  });

  it("returns correct commentCount for approved comments only", async () => {
    const pool = (await import("../db")).default;
    const USER_ID = "550e8400-e29b-41d4-a716-446655440006";

    await pool.query(
      "INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3)",
      [USER_ID, "Test User", "test@example.com"],
    );
    await pool.query("INSERT INTO posts (slug) VALUES ($1)", [
      "comment-count-test",
    ]);

    // Create 2 approved comments
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["comment-count-test", USER_ID, "Approved 1", "Approved"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["comment-count-test", USER_ID, "Approved 2", "Approved"],
    );

    // Create 1 pending comment
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["comment-count-test", USER_ID, "Pending", "Pending"],
    );

    const res = await request(app).get(
      "/api/posts/comment-count-test/likes",
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      likeCount: 0,
      commentCount: 2, // Only approved comments counted
      liked: false,
    });
  });

  it("returns 404 when slug is missing", async () => {
    const res = await request(app).get("/api/posts//likes");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/posts/:slug/like", () => {
  it("likes a post and returns liked: true with updated count", async () => {
    const res = await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ liked: true, count: 1 });
  });

  it("unlikes a post on second request (toggle)", async () => {
    await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    const res = await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ liked: false, count: 0 });
  });

  it("returns 400 when anonymous_id is missing", async () => {
    const res = await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when slug is missing", async () => {
    const res = await request(app)
      .post("/api/posts//like")
      .send({ anonymous_id: ANON_ID });

    expect(res.status).toBe(404);
  });

  it("creates post record if it does not exist", async () => {
    const pool = (await import("../db")).default;
    const LIKE_USER_ID = "550e8400-e29b-41d4-a716-446655440098";

    // Verify post doesn't exist
    const beforeCheck = await pool.query(
      "SELECT * FROM posts WHERE slug = $1",
      ["new-post-for-like"],
    );
    expect(beforeCheck.rows).toHaveLength(0);

    // Like non-existent post
    const res = await request(app)
      .post("/api/posts/new-post-for-like/like")
      .send({ anonymous_id: LIKE_USER_ID });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ liked: true, count: 1 });

    // Verify post was created
    const afterCheck = await pool.query(
      "SELECT * FROM posts WHERE slug = $1",
      ["new-post-for-like"],
    );
    expect(afterCheck.rows).toHaveLength(1);
    expect(afterCheck.rows[0].slug).toBe("new-post-for-like");
  });
});

describe("GET /api/posts/:slug/comments", () => {
  it("returns empty array when no approved comments exist", async () => {
    const res = await request(app).get("/api/posts/test-post/comments");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns only approved comments", async () => {
    const COMMENT_ID = "550e8400-e29b-41d4-a716-446655440003";

    // Create a pending comment
    await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: COMMENT_ID,
      name: "Test User",
      email: "test@example.com",
      body: "Pending comment",
    });

    const res = await request(app).get("/api/posts/test-post/comments");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns approved comments with user data and hashed user_id", async () => {
    const pool = (await import("../db")).default;
    const COMMENT_ID = "550e8400-e29b-41d4-a716-446655440004";

    // Create user and post
    await pool.query(
      "INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3)",
      [COMMENT_ID, "Jane Doe", "jane@example.com"],
    );
    await pool.query("INSERT INTO posts (slug) VALUES ($1)", ["test-post-2"]);

    // Create approved comment directly in DB
    const { rows: commentRows } = await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      ["test-post-2", COMMENT_ID, "This is approved", "Approved"],
    );

    const res = await request(app).get("/api/posts/test-post-2/comments");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const comment = res.body[0];
    expect(comment.body).toBe("This is approved");
    expect(comment.user_name).toBe("Jane Doe");
    expect(comment.status).toBe("Approved");
    expect(comment.post_slug).toBe("test-post-2");
    expect(comment.id).toBe(commentRows[0].id);

    // Verify user_id is hashed (not the original UUID)
    expect(comment.user_id).not.toBe(COMMENT_ID);
    expect(comment.user_id).toHaveLength(64); // SHA-256 hash length
  });

  it("returns comments ordered by created_at ascending", async () => {
    const pool = (await import("../db")).default;
    const USER_ID = "550e8400-e29b-41d4-a716-446655440005";

    await pool.query(
      "INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3)",
      [USER_ID, "Test User", "test@example.com"],
    );
    await pool.query("INSERT INTO posts (slug) VALUES ($1)", ["test-post-3"]);

    // Create three comments with different timestamps
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ["test-post-3", USER_ID, "Third comment", "Approved", "2024-01-03"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ["test-post-3", USER_ID, "First comment", "Approved", "2024-01-01"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ["test-post-3", USER_ID, "Second comment", "Approved", "2024-01-02"],
    );

    const res = await request(app).get("/api/posts/test-post-3/comments");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    // Verify order is by created_at ASC
    expect(res.body[0].body).toBe("First comment");
    expect(res.body[1].body).toBe("Second comment");
    expect(res.body[2].body).toBe("Third comment");
  });

  it("returns 404 when slug is missing", async () => {
    const res = await request(app).get("/api/posts//comments");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/posts/:slug/comment", () => {
  it("creates a comment with pending status", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "John Doe",
      email: "john@example.com",
      body: "This is a test comment",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      post_slug: "test-post",
      user_id: ANON_ID,
      body: "This is a test comment",
      status: "Pending",
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.created_at).toBeDefined();
  });

  it("creates user record when submitting comment", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "Jane Smith",
      email: "jane@example.com",
      body: "Another comment",
    });

    expect(res.status).toBe(201);
    expect(res.body.user_id).toBe(ANON_ID);
  });

  it("updates user info on subsequent comments from same anonymous_id", async () => {
    await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "Old Name",
      email: "old@example.com",
      body: "First comment",
    });

    const res = await request(app).post("/api/posts/another-post/comment").send({
      anonymous_id: ANON_ID,
      name: "New Name",
      email: "new@example.com",
      body: "Second comment",
    });

    expect(res.status).toBe(201);
  });

  it("returns 400 when anonymous_id is missing", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      name: "Test User",
      email: "test@example.com",
      body: "Comment without anon ID",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when anonymous_id is not a valid UUID", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: "not-a-uuid",
      name: "Test User",
      email: "test@example.com",
      body: "Comment with invalid UUID",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      email: "test@example.com",
      body: "Comment without name",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "Test User",
      body: "Comment without email",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "Test User",
      email: "not-an-email",
      body: "Comment with invalid email",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when body is missing", async () => {
    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "Test User",
      email: "test@example.com",
    });

    expect(res.status).toBe(400);
  });

  it("returns 404 when slug is missing", async () => {
    const res = await request(app)
      .post("/api/posts//comment")
      .send({
        anonymous_id: ANON_ID,
        name: "Test User",
        email: "test@example.com",
        body: "Comment",
      });

    expect(res.status).toBe(404);
  });

  it("calls notification functions when comment is created", async () => {
    const { sendNewCommentNotification, sendPendingCommentNotification, sendAutoApprovedCommentNotification } = await import("../email");
    const pool = (await import("../db")).default;

    const res = await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "John Doe",
      email: "john@example.com",
      body: "This should trigger an email",
    });

    expect(res.status).toBe(201);

    // With AI review enabled, wait for the async review process to complete before
    // checking notification calls (processCommentReview runs fire-and-forget)
    for (let i = 0; i < 50; i++) {
      const result = await pool.query(
        "SELECT latest_ai_review_id FROM comments WHERE id = $1",
        [res.body.id]
      );
      if (result.rows[0]?.latest_ai_review_id) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    // With AI review enabled, either sendPendingCommentNotification or sendAutoApprovedCommentNotification will be called
    // Without AI review, sendNewCommentNotification will be called
    const totalCalls =
      sendNewCommentNotification.mock.calls.length +
      sendPendingCommentNotification.mock.calls.length +
      sendAutoApprovedCommentNotification.mock.calls.length;

    expect(totalCalls).toBeGreaterThan(0);
  });

  it("creates post record if it does not exist", async () => {
    const pool = (await import("../db")).default;
    const NEW_USER_ID = "550e8400-e29b-41d4-a716-446655440099";

    // Verify post doesn't exist
    const beforeCheck = await pool.query(
      "SELECT * FROM posts WHERE slug = $1",
      ["brand-new-post"],
    );
    expect(beforeCheck.rows).toHaveLength(0);

    // Create comment for non-existent post
    const res = await request(app)
      .post("/api/posts/brand-new-post/comment")
      .send({
        anonymous_id: NEW_USER_ID,
        name: "New User",
        email: "new@example.com",
        body: "Comment on new post",
      });

    expect(res.status).toBe(201);

    // Verify post was created
    const afterCheck = await pool.query(
      "SELECT * FROM posts WHERE slug = $1",
      ["brand-new-post"],
    );
    expect(afterCheck.rows).toHaveLength(1);
    expect(afterCheck.rows[0].slug).toBe("brand-new-post");
  });
});
