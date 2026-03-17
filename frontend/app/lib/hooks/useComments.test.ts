/** Tests for useComments hook */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useComments } from "./useComments";

describe("useComments", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty comments and loading false", () => {
    const { result } = renderHook(() => useComments("my-post"));

    expect(result.current.comments).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets loading to true while fetching", async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useComments("my-post"));

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
  });

  it("returns comments sorted newest-first after refetch", async () => {
    const older = {
      id: "1",
      post_slug: "my-post",
      parent_id: null,
      user_id: "u1",
      body: "older comment",
      status: "Approved",
      created_at: "2024-01-01T10:00:00Z",
      status_updated_at: null,
      status_updated_by: null,
      latest_ai_review_id: null,
    };
    const newer = {
      id: "2",
      post_slug: "my-post",
      parent_id: null,
      user_id: "u2",
      body: "newer comment",
      status: "Approved",
      created_at: "2024-06-01T10:00:00Z",
      status_updated_at: null,
      status_updated_by: null,
      latest_ai_review_id: null,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([older, newer]), { status: 200 })
    );

    const { result } = renderHook(() => useComments("my-post"));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.comments[0].id).toBe("2");
    expect(result.current.comments[1].id).toBe("1");
    expect(result.current.error).toBeNull();
  });

  it("sets error and clears loading when fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useComments("my-post"));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.comments).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[useComments] Error fetching comments:",
      expect.any(Error)
    );
  });

  it("fetches from the correct endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    );

    const { result } = renderHook(() => useComments("some-slug"));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/posts/some-slug/comments")
    );
  });

  it("clears error on subsequent successful refetch", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );

    const { result } = renderHook(() => useComments("my-post"));

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    consoleSpy.mockRestore();
  });
});
