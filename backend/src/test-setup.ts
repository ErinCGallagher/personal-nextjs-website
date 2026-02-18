// Global Vitest lifecycle hooks shared across all test suites.
// Ensures the database schema is up to date before tests run and resets table
// data between each test to prevent state leaking across cases.
import { beforeAll, afterEach, afterAll } from 'vitest';
import pool from './db';
import { runMigrations } from './migrate';

beforeAll(async () => {
  await runMigrations(pool);
});

afterEach(async () => {
  // post_likes has ON DELETE CASCADE so deleting posts cleans up likes too
  await pool.query('DELETE FROM post_likes');
  await pool.query('DELETE FROM posts');
});

afterAll(async () => {
  await pool.end();
});
