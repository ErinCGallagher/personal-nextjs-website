/**
 * Isolated tests for rate limiting behaviour.
 * These tests override NODE_ENV so the limiters are not skipped,
 * allowing the actual rate limiting logic to be exercised.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import type { Application } from "express";

describe("loginLimiter", () => {
  let app: Application;

  beforeAll(async () => {
    // Override NODE_ENV so isTest evaluates to false inside the module,
    // which allows the skip function to return false and rate limiting to apply.
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { loginLimiter } = await import("./rate-limiters");

    app = express();
    app.use(loginLimiter);
    app.post("/login", (_req, res) => res.json({ ok: true }));
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("blocks requests after exceeding 5 attempts from the same IP", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/login");
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).post("/login");
    expect(blocked.status).toBe(429);
    expect(blocked.text).toContain("Too many login attempts");
  });
});
