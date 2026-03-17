/** Tests for useEngagement hook */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useEngagement } from "./useEngagement";

vi.mock("@/app/lib/anonymous-id", () => ({
  getAnonymousId: () => "test-anon-id",
}));

describe("useEngagement", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with likeCount null, liked false, commentCount 0", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useEngagement("my-post"));

    expect(result.current.likeCount).toBeNull();
    expect(result.current.liked).toBe(false);
    expect(result.current.commentCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it("fetches and sets engagement data on mount", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ likeCount: 5, liked: true, commentCount: 3 }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useEngagement("my-post"));

    await waitFor(() => expect(result.current.likeCount).toBe(5));
    expect(result.current.liked).toBe(true);
    expect(result.current.commentCount).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it("defaults commentCount to 0 when missing from response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ likeCount: 2, liked: false }), {
        status: 200,
      })
    );

    const { result } = renderHook(() => useEngagement("my-post"));

    await waitFor(() => expect(result.current.likeCount).toBe(2));
    expect(result.current.commentCount).toBe(0);
  });

  it("sets error when fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useEngagement("my-post"));

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.likeCount).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[useEngagement] Error fetching engagement:",
      expect.any(Error)
    );
  });

  it("fetches from the correct endpoint with anonymous_id", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ likeCount: 0, liked: false }), {
        status: 200,
      })
    );

    renderHook(() => useEngagement("some-slug"));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("some-slug/likes?anonymous_id=test-anon-id")
      )
    );
  });

  it("toggleLike does an optimistic update before server response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ likeCount: 2, liked: false, commentCount: 0 }), { status: 200 })
    );
    // POST response never resolves (simulates slow server)
    vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useEngagement("my-post"));

    await waitFor(() => expect(result.current.likeCount).toBe(2));

    act(() => {
      result.current.toggleLike();
    });

    // Optimistic update: liked flips, likeCount increments
    expect(result.current.liked).toBe(true);
    expect(result.current.likeCount).toBe(3);
  });

  it("syncs state with server response after toggleLike", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ likeCount: 2, liked: false, commentCount: 0 }), { status: 200 })
    );
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ count: 3, liked: true }), { status: 200 })
    );

    const { result } = renderHook(() => useEngagement("my-post"));

    await waitFor(() => expect(result.current.likeCount).toBe(2));

    act(() => {
      result.current.toggleLike();
    });

    await waitFor(() => expect(result.current.likeCount).toBe(3));
    expect(result.current.liked).toBe(true);
  });

  it("logs error when toggleLike POST fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ likeCount: 1, liked: false, commentCount: 0 }), { status: 200 })
    );
    vi.mocked(fetch).mockRejectedValueOnce(new Error("POST failed"));

    const { result } = renderHook(() => useEngagement("my-post"));

    await waitFor(() => expect(result.current.likeCount).toBe(1));

    act(() => {
      result.current.toggleLike();
    });

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "[useEngagement] Error toggling like:",
        expect.any(Error)
      )
    );
  });
});
