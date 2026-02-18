import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../index";

const ANON_ID = "00000000-0000-0000-0000-000000000001";

describe("GET /api/posts/:slug/likes", () => {
  it("returns 0 for a post with no likes", async () => {
    const res = await request(app).get("/api/posts/cape-town-itinerary/likes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 0 });
  });

  it("returns 404 when slug is missing", async () => {
    const res = await request(app).get("/api/posts//likes");
    expect(res.status).toBe(404);
  });

  it("returns the correct count after a like", async () => {
    await request(app)
      .post("/api/posts/cape-town-itinerary/like")
      .send({ anonymous_id: ANON_ID });

    const res = await request(app).get("/api/posts/cape-town-itinerary/likes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 1 });
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
