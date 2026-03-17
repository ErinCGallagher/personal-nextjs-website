/** Tests for useAdminAuth hook */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAdminAuth } from "./useAdminAuth";

describe("useAdminAuth", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with loading true and role null", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.role).toBeNull();
  });

  it("returns the user role from the session", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: { role: "admin" } }), { status: 200 })
    );

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("admin");
  });

  it("returns null role when session has no user", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBeNull();
  });

  it("returns null role when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 401 })
    );

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBeNull();
  });

  it("returns null role when fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[useAdminAuth] Error fetching session:",
      expect.any(Error)
    );
  });

  it("fetches from the session endpoint with credentials", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: { role: "family" } }), { status: 200 })
    );

    renderHook(() => useAdminAuth());

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/auth/get-session", {
        credentials: "include",
      })
    );
  });
});
