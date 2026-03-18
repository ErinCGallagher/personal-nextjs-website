import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "../index";

const mockSearch = vi.fn();

vi.mock("../services/elasticsearch", () => ({
  getElasticsearchClient: vi.fn(() => ({ search: mockSearch })),
}));

const mockHits = {
  total: { value: 1 },
  hits: [
    {
      _source: {
        slug: "yellowstone-winter",
        title: "Yellowstone Winter",
        summary: "A cold trip",
        tags: ["Hiking"],
        publishedAt: "2024-01-01",
      },
      _score: 1.5,
    },
  ],
};

describe("GET /api/search", () => {
  it("returns results for a text-only query", async () => {
    mockSearch.mockResolvedValue({ body: { hits: mockHits } });

    const res = await request(app).get("/api/search?q=yellowstone");

    expect(res.status).toBe(200);
    expect(res.body.query).toBe("yellowstone");
    expect(res.body.filters).toEqual({ tags: [] });
    expect(res.body.results).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it("returns results for tags-only query", async () => {
    mockSearch.mockResolvedValue({ body: { hits: mockHits } });

    const res = await request(app).get("/api/search?tags=Hiking");

    expect(res.status).toBe(200);
    expect(res.body.filters).toEqual({ tags: ["Hiking"] });
    expect(res.body.results).toHaveLength(1);
  });

  it("returns results for combined text and tag query", async () => {
    mockSearch.mockResolvedValue({ body: { hits: mockHits } });

    const res = await request(app).get("/api/search?q=yellowstone&tags=Hiking&tags=Safari");

    expect(res.status).toBe(200);
    expect(res.body.query).toBe("yellowstone");
    expect(res.body.filters).toEqual({ tags: ["Hiking", "Safari"] });
    expect(res.body.results).toHaveLength(1);
  });

  it("returns 400 when neither q nor tags are provided", async () => {
    const res = await request(app).get("/api/search");
    expect(res.status).toBe(400);
  });

  it("returns 500 when Elasticsearch is unavailable", async () => {
    mockSearch.mockRejectedValue(new Error("Connection refused"));

    const res = await request(app).get("/api/search?q=yellowstone");
    expect(res.status).toBe(500);
  });
});
