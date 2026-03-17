/** Tests for the centralised API client — routes map and fetch helpers */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { routes, apiFetch, serverFetch } from "./api";

describe("routes", () => {
  describe("posts", () => {
    it("likes builds path with slug and anonymousId", () => {
      expect(routes.posts.likes("my-post", "anon-123")).toBe(
        "/api/posts/my-post/likes?anonymous_id=anon-123"
      );
    });

    it("like builds path with slug", () => {
      expect(routes.posts.like("my-post")).toBe("/api/posts/my-post/like");
    });

    it("comments builds path with slug", () => {
      expect(routes.posts.comments("my-post")).toBe(
        "/api/posts/my-post/comments"
      );
    });

    it("comment builds path with slug", () => {
      expect(routes.posts.comment("my-post")).toBe(
        "/api/posts/my-post/comment"
      );
    });
  });

  describe("admin", () => {
    it("comments with no status returns base path", () => {
      expect(routes.admin.comments()).toBe("/api/admin/comments");
    });

    it("comments with status appends query param", () => {
      expect(routes.admin.comments("pending")).toBe(
        "/api/admin/comments?status=pending"
      );
    });

    it("comment builds path with id", () => {
      expect(routes.admin.comment("abc-123")).toBe(
        "/api/admin/comments/abc-123"
      );
    });

    it("travel returns correct path", () => {
      expect(routes.admin.travel()).toBe("/api/admin/travel");
    });
  });

  describe("auth", () => {
    it("session returns correct path", () => {
      expect(routes.auth.session()).toBe("/api/auth/get-session");
    });
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetch with the given path", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await apiFetch("/api/posts/my-post/likes?anonymous_id=anon-123");

    expect(fetch).toHaveBeenCalledWith(
      "/api/posts/my-post/likes?anonymous_id=anon-123",
      undefined
    );
  });

  it("returns parsed JSON on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ likeCount: 5 }), { status: 200 })
    );

    const result = await apiFetch<{ likeCount: number }>(
      "/api/posts/my-post/likes?anonymous_id=anon-123"
    );

    expect(result).toEqual({ likeCount: 5 });
  });

  it("throws on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Not Found", { status: 404 })
    );

    await expect(
      apiFetch("/api/posts/my-post/likes?anonymous_id=anon-123")
    ).rejects.toThrow("404");
  });

  it("passes options through to fetch", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await apiFetch("/api/admin/comments", {
      method: "PATCH",
      credentials: "include",
    });

    expect(fetch).toHaveBeenCalledWith("/api/admin/comments", {
      method: "PATCH",
      credentials: "include",
    });
  });
});

describe("serverFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("prepends NEXT_PUBLIC_API_URL to the path", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await serverFetch("/api/auth/get-session");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/auth/get-session",
      expect.any(Object)
    );
  });

  it("falls back to localhost:3001 when NEXT_PUBLIC_API_URL is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await serverFetch("/api/auth/get-session");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/get-session",
      expect.any(Object)
    );
  });

  it("includes Cookie header when cookieHeader is provided", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await serverFetch("/api/auth/get-session", "session=abc; other=xyz");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: "session=abc; other=xyz",
        }),
      })
    );
  });

  it("sets cache: no-store", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await serverFetch("/api/auth/get-session");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("returns parsed JSON on success", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: { role: "admin" } }), { status: 200 })
    );

    const result = await serverFetch<{ user: { role: string } }>(
      "/api/auth/get-session"
    );

    expect(result).toEqual({ user: { role: "admin" } });
  });

  it("throws on non-ok response", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.mocked(fetch).mockResolvedValue(
      new Response("Unauthorized", { status: 401 })
    );

    await expect(serverFetch("/api/auth/get-session")).rejects.toThrow("401");
  });
});
