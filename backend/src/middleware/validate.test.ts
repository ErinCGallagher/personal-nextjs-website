/**
 * Tests for the validateRequest middleware.
 */
import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateRequest } from "./validate";

function buildApp(schema: z.ZodTypeAny) {
  const app = express();
  app.use(express.json());
  app.post("/:slug", validateRequest(schema), (req, res) => {
    res.json({ validated: res.locals.validated });
  });
  return app;
}

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  count: z.coerce.number().optional(),
});

describe("validateRequest", () => {
  it("calls next() and stores parsed data in res.locals.validated on success", async () => {
    const app = buildApp(schema);

    const res = await request(app)
      .post("/my-post")
      .send({ name: "Alice" });

    expect(res.status).toBe(200);
    expect(res.body.validated).toEqual({ slug: "my-post", name: "Alice" });
  });

  it("returns 400 with a structured error when validation fails", async () => {
    const app = buildApp(schema);

    const res = await request(app)
      .post("/my-post")
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("merges params, query, and body", async () => {
    const mergedSchema = z.object({
      slug: z.string(),
      filter: z.string().optional(),
      name: z.string(),
    });
    const app = buildApp(mergedSchema);

    const res = await request(app)
      .post("/hello?filter=active")
      .send({ name: "Bob" });

    expect(res.status).toBe(200);
    expect(res.body.validated).toEqual({
      slug: "hello",
      filter: "active",
      name: "Bob",
    });
  });

  it("params take precedence over body on key conflict", async () => {
    const conflictSchema = z.object({ slug: z.string() });
    const app = buildApp(conflictSchema);

    // Body also contains 'slug' — params should win
    const res = await request(app)
      .post("/real-slug")
      .send({ slug: "injected-slug" });

    expect(res.status).toBe(200);
    expect(res.body.validated.slug).toBe("real-slug");
  });

  it("does not call the route handler when validation fails", async () => {
    const app = buildApp(schema);

    const res = await request(app)
      .post("/my-post")
      .send({});

    expect(res.status).toBe(400);
    // If the handler ran it would return 200 with validated data
    expect(res.body).not.toHaveProperty("validated");
  });
});
