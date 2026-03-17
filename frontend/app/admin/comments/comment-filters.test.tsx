/** Tests for CommentFilters component */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommentFilters from "./comment-filters";
import type { StatusFilter } from "./comment-filters";

const defaultProps = {
  filter: "" as StatusFilter,
  postFilter: "",
  uniquePostSlugs: [],
  onStatusChange: vi.fn(),
  onPostChange: vi.fn(),
};

describe("CommentFilters", () => {
  it("renders all four status filter options", () => {
    render(<CommentFilters {...defaultProps} />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.getByText("Approved")).toBeTruthy();
    expect(screen.getByText("Rejected")).toBeTruthy();
  });

  it("does not render post filter section when there are no post slugs", () => {
    render(<CommentFilters {...defaultProps} uniquePostSlugs={[]} />);
    expect(screen.queryByText("All Posts")).toBeNull();
  });

  it("renders post filter buttons when slugs are provided", () => {
    render(
      <CommentFilters
        {...defaultProps}
        uniquePostSlugs={["post-a", "post-b"]}
      />
    );
    expect(screen.getByText("All Posts")).toBeTruthy();
    expect(screen.getByText("post-a")).toBeTruthy();
    expect(screen.getByText("post-b")).toBeTruthy();
  });

  it("calls onStatusChange with the correct value when a status filter is clicked", () => {
    const onStatusChange = vi.fn();
    render(<CommentFilters {...defaultProps} onStatusChange={onStatusChange} />);
    fireEvent.click(screen.getByText("Pending"));
    expect(onStatusChange).toHaveBeenCalledWith("Pending");
  });

  it("calls onStatusChange with empty string when All is clicked", () => {
    const onStatusChange = vi.fn();
    render(
      <CommentFilters {...defaultProps} filter="Pending" onStatusChange={onStatusChange} />
    );
    fireEvent.click(screen.getByText("All"));
    expect(onStatusChange).toHaveBeenCalledWith("");
  });

  it("calls onPostChange with the slug when a post filter is clicked", () => {
    const onPostChange = vi.fn();
    render(
      <CommentFilters
        {...defaultProps}
        uniquePostSlugs={["my-post"]}
        onPostChange={onPostChange}
      />
    );
    fireEvent.click(screen.getByText("my-post"));
    expect(onPostChange).toHaveBeenCalledWith("my-post");
  });

  it("calls onPostChange with empty string when All Posts is clicked", () => {
    const onPostChange = vi.fn();
    render(
      <CommentFilters
        {...defaultProps}
        uniquePostSlugs={["my-post"]}
        postFilter="my-post"
        onPostChange={onPostChange}
      />
    );
    fireEvent.click(screen.getByText("All Posts"));
    expect(onPostChange).toHaveBeenCalledWith("");
  });
});
