/**
 * Tests for the OpenSearch health check endpoint.
 */

import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "../index";

const mockClusterHealth = vi.fn();

vi.mock("../services/elasticsearch", () => ({
  getElasticsearchClient: vi.fn(() => ({
    cluster: { health: mockClusterHealth },
  })),
}));

describe("GET /api/health/opensearch", () => {
  it("returns up when cluster status is green", async () => {
    mockClusterHealth.mockResolvedValue({ body: { status: "green" } });

    const res = await request(app).get("/api/health/opensearch");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("up");
    expect(res.body.cluster.status).toBe("green");
  });

  it("returns up when cluster status is yellow", async () => {
    mockClusterHealth.mockResolvedValue({ body: { status: "yellow" } });

    const res = await request(app).get("/api/health/opensearch");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("up");
  });

  it("returns degraded when cluster status is red", async () => {
    mockClusterHealth.mockResolvedValue({ body: { status: "red" } });

    const res = await request(app).get("/api/health/opensearch");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("degraded");
  });

  it("returns 503 down when OpenSearch is unreachable", async () => {
    mockClusterHealth.mockRejectedValue(new Error("Connection refused"));

    const res = await request(app).get("/api/health/opensearch");

    expect(res.status).toBe(503);
    expect(res.body.status).toBe("down");
  });
});
