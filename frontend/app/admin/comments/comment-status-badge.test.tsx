/** Tests for CommentStatusBadge component */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentStatusBadge from "./comment-status-badge";

describe("CommentStatusBadge", () => {
  it("renders the status text", () => {
    render(<CommentStatusBadge status="Pending" />);
    expect(screen.getByText("Pending")).toBeTruthy();
  });

  it("applies green classes for Approved status", () => {
    const { container } = render(<CommentStatusBadge status="Approved" />);
    expect(container.firstChild).toHaveProperty(
      "className",
      expect.stringContaining("bg-green-100")
    );
  });

  it("applies red classes for Rejected status", () => {
    const { container } = render(<CommentStatusBadge status="Rejected" />);
    expect(container.firstChild).toHaveProperty(
      "className",
      expect.stringContaining("bg-red-100")
    );
  });

  it("applies yellow classes for Pending status", () => {
    const { container } = render(<CommentStatusBadge status="Pending" />);
    expect(container.firstChild).toHaveProperty(
      "className",
      expect.stringContaining("bg-yellow-100")
    );
  });
});
