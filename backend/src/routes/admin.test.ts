/**
 * Unit tests for admin routes.
 * Tests BetterAuth authentication and comment moderation functionality.
 */
import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import app from "../index";
import pool from "../db";
import { auth } from "../auth";

const TEST_ADMIN_EMAIL = "test-admin@example.com";
const TEST_ADMIN_PASSWORD = "test_password_123";
const TEST_ADMIN_NAME = "Test Admin";

let testAdminId: string;

// Helper to create authenticated agent using BetterAuth
async function createAuthenticatedAgent() {
  const agent = request.agent(app);
  const email = (global as any).TEST_ADMIN_EMAIL_RUNTIME || TEST_ADMIN_EMAIL;

  // Sign in using BetterAuth
  const res = await agent
    .post("/api/auth/sign-in/email")
    .send({ email, password: TEST_ADMIN_PASSWORD });

  if (res.status !== 200) {
    throw new Error(`Failed to authenticate: ${res.status} ${JSON.stringify(res.body)}`);
  }

  // Verify cookies were set
  if (!res.headers["set-cookie"]) {
    throw new Error("No session cookie set after authentication");
  }

  return agent;
}

beforeAll(async () => {
  // Use a timestamp-based unique email to avoid conflicts
  const timestamp = Date.now();
  const uniqueEmail = `test-admin-${timestamp}@example.com`;

  // Clean up any existing test admin users (older than 1 minute to avoid interfering with parallel tests)
  await pool.query(
    'DELETE FROM "user" WHERE email LIKE $1 AND "createdAt" < NOW() - INTERVAL \'1 minute\'',
    ["test-admin-%@example.com"]
  );

  // Create test admin user with unique email
  const signUpRes = await auth.api.signUpEmail({
    body: {
      email: uniqueEmail,
      password: TEST_ADMIN_PASSWORD,
      name: TEST_ADMIN_NAME,
    },
  });

  if (!signUpRes || !signUpRes.user) {
    throw new Error("Failed to create test admin user");
  }

  testAdminId = signUpRes.user.id;

  // Set user role to admin
  await pool.query('UPDATE "user" SET role = $1 WHERE id = $2', [
    "admin",
    testAdminId,
  ]);

  // Update TEST_ADMIN_EMAIL for use in tests
  (global as any).TEST_ADMIN_EMAIL_RUNTIME = uniqueEmail;
});

afterAll(async () => {
  // Clean up test admin user
  await pool.query('DELETE FROM "user" WHERE id = $1', [testAdminId]);
});

describe("BetterAuth integration", () => {
  it("authenticates admin user via BetterAuth", async () => {
    const email = (global as any).TEST_ADMIN_EMAIL_RUNTIME || TEST_ADMIN_EMAIL;
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: TEST_ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe("admin");
  });

  it("rejects invalid credentials", async () => {
    const email = (global as any).TEST_ADMIN_EMAIL_RUNTIME || TEST_ADMIN_EMAIL;
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: "wrong_password" });

    expect(res.status).toBe(401);
  });

  it("signs out successfully", async () => {
    const agent = await createAuthenticatedAgent();

    const res = await agent.post("/api/auth/sign-out");

    expect(res.status).toBe(200);
  });
});

describe("GET /api/admin/comments", () => {
  const USER_ID = "550e8400-e29b-41d4-a716-446655440010";
  let agent: request.SuperAgentTest;

  beforeEach(async () => {
    agent = await createAuthenticatedAgent();

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
    agent = await createAuthenticatedAgent();

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
