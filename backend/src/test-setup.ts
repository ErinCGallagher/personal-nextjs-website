// Global Vitest lifecycle hooks shared across all test suites.
// Ensures the database schema is up to date before tests run and resets table
// data between each test to prevent state leaking across cases.
import { beforeAll, afterEach, afterAll } from "vitest";
import pool from "./db";
import { runMigrations } from "./migrate";

beforeAll(async () => {
  await runMigrations(pool);
});

afterEach(async () => {
  // Clean up all tables in correct order to respect foreign key constraints
  await pool.query("DELETE FROM ai_comment_reviews");
  await pool.query("DELETE FROM comments");
  await pool.query("DELETE FROM post_likes");
  await pool.query("DELETE FROM posts");
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end();
});
