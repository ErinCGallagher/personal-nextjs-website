import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "../index";

vi.mock("../services/elasticsearch", () => ({
  getElasticsearchClient: vi.fn(() => ({
    search: vi.fn().mockResolvedValue({
      body: {
        hits: { total: { value: 16 } },
        aggregations: {
          tags: {
            buckets: [
              { key: "Safari", doc_count: 5 },
              { key: "Hiking", doc_count: 3 },
              { key: "Camping", doc_count: 1 },
            ],
          },
        },
      },
    }),
  })),
}));

describe("GET /api/tags/aggregations", () => {
  it("returns tag counts sorted by count descending", async () => {
    const res = await request(app).get("/api/tags/aggregations");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 16,
      tags: [
        { name: "Safari", count: 5 },
        { name: "Hiking", count: 3 },
        { name: "Camping", count: 1 },
      ],
    });
  });

  it("returns empty tags array when no tags exist", async () => {
    const { getElasticsearchClient } = await import("../services/elasticsearch");
    vi.mocked(getElasticsearchClient).mockReturnValueOnce({
      search: vi.fn().mockResolvedValue({
        body: {
          hits: { total: { value: 0 } },
          aggregations: { tags: { buckets: [] } },
        },
      }),
    } as never);

    const res = await request(app).get("/api/tags/aggregations");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 0, tags: [] });
  });

  it("returns 500 when Elasticsearch is unavailable", async () => {
    const { getElasticsearchClient } = await import("../services/elasticsearch");
    vi.mocked(getElasticsearchClient).mockReturnValueOnce({
      search: vi.fn().mockRejectedValue(new Error("Connection refused")),
    } as never);

    const res = await request(app).get("/api/tags/aggregations");
    expect(res.status).toBe(500);
  });
});
