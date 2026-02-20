import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "../index";

const ANON_ID = "550e8400-e29b-41d4-a716-446655440001";

// Mock the email module to prevent actual emails during tests
vi.mock("../email", () => ({
  sendNewCommentNotification: vi.fn().mockResolvedValue(undefined),
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

  it("calls sendNewCommentNotification when comment is created", async () => {
    const { sendNewCommentNotification } = await import("../email");

    await request(app).post("/api/posts/test-post/comment").send({
      anonymous_id: ANON_ID,
      name: "John Doe",
      email: "john@example.com",
      body: "This should trigger an email",
    });

    expect(sendNewCommentNotification).toHaveBeenCalledWith({
      postSlug: "test-post",
      commentBody: "This should trigger an email",
      userName: "John Doe",
      userEmail: "john@example.com",
    });
  });
});
