/** Tests for anonymous ID utility */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAnonymousId } from "./anonymous-id";

describe("getAnonymousId", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    });
    vi.restoreAllMocks();
  });

  it("generates and stores a new ID when none exists", () => {
    const id = getAnonymousId();

    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(store["anonymous_id"]).toBe(id);
  });

  it("returns the existing ID on subsequent calls", () => {
    const first = getAnonymousId();
    const second = getAnonymousId();

    expect(second).toBe(first);
  });

  it("returns a pre-existing ID from localStorage", () => {
    const existing = "00000000-0000-4000-8000-000000000001";
    store["anonymous_id"] = existing;

    expect(getAnonymousId()).toBe(existing);
  });

  it("does not call crypto.randomUUID when an ID already exists", () => {
    store["anonymous_id"] = "00000000-0000-4000-8000-000000000001";
    const spy = vi.spyOn(crypto, "randomUUID");

    getAnonymousId();

    expect(spy).not.toHaveBeenCalled();
  });
});
