/** Tests for TagFilterList component */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TagFilterList } from "./TagFilterList";

vi.mock("@/app/lib/api", () => ({
  apiFetch: vi.fn(),
  routes: {
    tags: { aggregations: () => "/api/tags/aggregations" },
  },
}));

const mockTags = [
  { name: "Safari", count: 5 },
  { name: "Hiking", count: 3 },
];

describe("TagFilterList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tag pills after loading", async () => {
    const { apiFetch } = await import("@/app/lib/api");
    vi.mocked(apiFetch).mockResolvedValue({ total: 8, tags: mockTags });

    render(<TagFilterList selectedTags={[]} onToggle={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Safari")).toBeTruthy();
      expect(screen.getByText("Hiking")).toBeTruthy();
    });
  });

  it("shows loading state while fetching", async () => {
    const { apiFetch } = await import("@/app/lib/api");
    vi.mocked(apiFetch).mockReturnValue(new Promise(() => {}));

    render(<TagFilterList selectedTags={[]} onToggle={vi.fn()} />);

    expect(screen.getByText("Loading tags…")).toBeTruthy();
  });

  it("shows error state when fetch fails", async () => {
    const { apiFetch } = await import("@/app/lib/api");
    vi.mocked(apiFetch).mockRejectedValue(new Error("Network error"));

    render(<TagFilterList selectedTags={[]} onToggle={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/could not load tags/i)).toBeTruthy();
    });
  });

  it("calls onToggle with the tag name when a pill is clicked", async () => {
    const { apiFetch } = await import("@/app/lib/api");
    vi.mocked(apiFetch).mockResolvedValue({ total: 8, tags: mockTags });
    const onToggle = vi.fn();

    render(<TagFilterList selectedTags={[]} onToggle={onToggle} />);

    await waitFor(() => screen.getByText("Safari"));
    fireEvent.click(screen.getByText("Safari").closest("button")!);

    expect(onToggle).toHaveBeenCalledWith("Safari");
  });

  it("marks selected tags with aria-pressed=true", async () => {
    const { apiFetch } = await import("@/app/lib/api");
    vi.mocked(apiFetch).mockResolvedValue({ total: 8, tags: mockTags });

    render(<TagFilterList selectedTags={["Safari"]} onToggle={vi.fn()} />);

    await waitFor(() => screen.getByText("Safari"));

    const safariBtn = screen.getByText("Safari").closest("button");
    const hikingBtn = screen.getByText("Hiking").closest("button");

    expect(safariBtn?.getAttribute("aria-pressed")).toBe("true");
    expect(hikingBtn?.getAttribute("aria-pressed")).toBe("false");
  });

  it("supports multiple simultaneously selected tags", async () => {
    const { apiFetch } = await import("@/app/lib/api");
    vi.mocked(apiFetch).mockResolvedValue({ total: 8, tags: mockTags });

    render(<TagFilterList selectedTags={["Safari", "Hiking"]} onToggle={vi.fn()} />);

    await waitFor(() => screen.getByText("Safari"));

    expect(screen.getByText("Safari").closest("button")?.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Hiking").closest("button")?.getAttribute("aria-pressed")).toBe("true");
  });
});
