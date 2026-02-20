/**
 * Unit tests for admin routes.
 * Tests authentication and comment moderation functionality.
 */
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import pool from "../db";

const ADMIN_PASSWORD = "test_password";

describe("POST /api/admin/login", () => {
  it("authenticates with correct password", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ password: ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects invalid password", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ password: "wrong_password" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid password" });
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app).post("/api/admin/login").send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/admin/logout", () => {
  it("destroys session successfully", async () => {
    const agent = request.agent(app);

    await agent.post("/api/admin/login").send({ password: ADMIN_PASSWORD });

    const res = await agent.post("/api/admin/logout");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe("GET /api/admin/comments", () => {
  const USER_ID = "550e8400-e29b-41d4-a716-446655440010";
  let agent: request.SuperAgentTest;

  beforeEach(async () => {
    agent = request.agent(app);
    await agent.post("/api/admin/login").send({ password: ADMIN_PASSWORD });

    await pool.query(
      "INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [USER_ID, "Admin Test User", "admin-test@example.com"],
    );
    await pool.query(
      "INSERT INTO posts (slug) VALUES ($1) ON CONFLICT DO NOTHING",
      ["admin-test-post"],
    );
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/admin/comments");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns all comments when no status filter", async () => {
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Pending comment", "Pending"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Approved comment", "Approved"],
    );

    const res = await agent.get("/api/admin/comments");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filters comments by status=Pending", async () => {
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Pending 1", "Pending"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Pending 2", "Pending"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Approved", "Approved"],
    );

    const res = await agent.get("/api/admin/comments?status=Pending");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].status).toBe("Pending");
    expect(res.body[1].status).toBe("Pending");
  });

  it("filters comments by status=Approved", async () => {
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Pending", "Pending"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Approved", "Approved"],
    );

    const res = await agent.get("/api/admin/comments?status=Approved");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("Approved");
  });

  it("filters comments by status=Rejected", async () => {
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Rejected comment", "Rejected"],
    );

    const res = await agent.get("/api/admin/comments?status=Rejected");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("Rejected");
  });

  it("returns comments with user email", async () => {
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)`,
      ["admin-test-post", USER_ID, "Test comment", "Pending"],
    );

    const res = await agent.get("/api/admin/comments");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].email).toBe("admin-test@example.com");
    expect(res.body[0].user_name).toBe("Admin Test User");
  });

  it("returns comments ordered by created_at DESC", async () => {
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ["admin-test-post", USER_ID, "First", "Pending", "2024-01-01"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ["admin-test-post", USER_ID, "Third", "Pending", "2024-01-03"],
    );
    await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ["admin-test-post", USER_ID, "Second", "Pending", "2024-01-02"],
    );

    const res = await agent.get("/api/admin/comments");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].body).toBe("Third");
    expect(res.body[1].body).toBe("Second");
    expect(res.body[2].body).toBe("First");
  });

  it("returns 400 for invalid status enum", async () => {
    const res = await agent.get("/api/admin/comments?status=InvalidStatus");

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/admin/comments/:id", () => {
  const USER_ID = "550e8400-e29b-41d4-a716-446655440011";
  let agent: request.SuperAgentTest;
  let commentId: string;

  beforeEach(async () => {
    agent = request.agent(app);
    await agent.post("/api/admin/login").send({ password: ADMIN_PASSWORD });

    await pool.query(
      "INSERT INTO users (anonymous_id, name, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [USER_ID, "Comment Test User", "comment-test@example.com"],
    );
    await pool.query(
      "INSERT INTO posts (slug) VALUES ($1) ON CONFLICT DO NOTHING",
      ["comment-update-test"],
    );

    const { rows } = await pool.query(
      `INSERT INTO comments (post_slug, user_id, body, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ["comment-update-test", USER_ID, "Test comment", "Pending"],
    );
    commentId = rows[0].id;
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .patch(`/api/admin/comments/${commentId}`)
      .send({ status: "Approved" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("approves a pending comment", async () => {
    const res = await agent
      .patch(`/api/admin/comments/${commentId}`)
      .send({ status: "Approved" });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(commentId);
    expect(res.body.status).toBe("Approved");
    expect(res.body.status_updated_at).toBeDefined();
    expect(res.body.status_updated_by).toBe("admin");
  });

  it("rejects a pending comment", async () => {
    const res = await agent
      .patch(`/api/admin/comments/${commentId}`)
      .send({ status: "Rejected" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Rejected");
    expect(res.body.status_updated_by).toBe("admin");
  });

  it("changes comment back to pending", async () => {
    await agent
      .patch(`/api/admin/comments/${commentId}`)
      .send({ status: "Approved" });

    const res = await agent
      .patch(`/api/admin/comments/${commentId}`)
      .send({ status: "Pending" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Pending");
  });

  it("returns 404 when comment does not exist", async () => {
    const fakeId = "550e8400-e29b-41d4-a716-446655440999";

    const res = await agent
      .patch(`/api/admin/comments/${fakeId}`)
      .send({ status: "Approved" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Comment not found" });
  });

  it("returns 400 when status is invalid", async () => {
    const res = await agent
      .patch(`/api/admin/comments/${commentId}`)
      .send({ status: "InvalidStatus" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when status is missing", async () => {
    const res = await agent
      .patch(`/api/admin/comments/${commentId}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when comment id is not a valid UUID", async () => {
    const res = await agent
      .patch("/api/admin/comments/not-a-uuid")
      .send({ status: "Approved" });

    expect(res.status).toBe(400);
  });
});
