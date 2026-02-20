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
    expect(res.body).toEqual({ count: 0, liked: false });
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
    expect(res.body).toEqual({ count: 1, liked: false });
  });

  it("returns liked true when anonymous_id has liked the post", async () => {
    await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    const res = await request(app).get(
      `/api/posts/cape-town-itinerary/likes?anonymous_id=${ANON_ID}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 1, liked: true });
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
