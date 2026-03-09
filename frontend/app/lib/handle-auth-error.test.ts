/** Tests for authentication error handling utility */

import { describe, it, expect, vi } from "vitest";
import { handleAuthResponse } from "./handle-auth-error";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

describe("handleAuthResponse", () => {
  it("redirects to /admin on 401 response", () => {
    const response = new Response(null, { status: 401 });

    expect(() => handleAuthResponse(response)).toThrow("NEXT_REDIRECT:/admin");
  });

  it("throws error on 500 response", () => {
    const response = new Response(null, { status: 500 });

    expect(() => handleAuthResponse(response)).toThrow(
      "Request failed with status 500"
    );
  });

  it("throws error on 404 response", () => {
    const response = new Response(null, { status: 404 });

    expect(() => handleAuthResponse(response)).toThrow(
      "Request failed with status 404"
    );
  });

  it("throws error on 403 response", () => {
    const response = new Response(null, { status: 403 });

    expect(() => handleAuthResponse(response)).toThrow(
      "Request failed with status 403"
    );
  });

  it("returns response unchanged on 200 OK", () => {
    const response = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    });

    const result = handleAuthResponse(response);

    expect(result).toBe(response);
    expect(result.status).toBe(200);
  });

  it("returns response unchanged on 201 Created", () => {
    const response = new Response(null, { status: 201 });

    const result = handleAuthResponse(response);

    expect(result).toBe(response);
    expect(result.status).toBe(201);
  });

  it("returns response unchanged on 204 No Content", () => {
    const response = new Response(null, { status: 204 });

    const result = handleAuthResponse(response);

    expect(result).toBe(response);
    expect(result.status).toBe(204);
  });
});
