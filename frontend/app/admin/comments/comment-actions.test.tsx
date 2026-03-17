/** Tests for CommentActions component */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommentActions from "./comment-actions";

describe("CommentActions", () => {
  it("shows both buttons when status is Pending", () => {
    render(<CommentActions status="Pending" onUpdateStatus={vi.fn()} />);
    expect(screen.getByText("Approve")).toBeTruthy();
    expect(screen.getByText("Reject")).toBeTruthy();
  });

  it("hides Approve button when status is Approved", () => {
    render(<CommentActions status="Approved" onUpdateStatus={vi.fn()} />);
    expect(screen.queryByText("Approve")).toBeNull();
    expect(screen.getByText("Reject")).toBeTruthy();
  });

  it("hides Reject button when status is Rejected", () => {
    render(<CommentActions status="Rejected" onUpdateStatus={vi.fn()} />);
    expect(screen.getByText("Approve")).toBeTruthy();
    expect(screen.queryByText("Reject")).toBeNull();
  });

  it("calls onUpdateStatus with 'Approved' when Approve is clicked", () => {
    const onUpdateStatus = vi.fn();
    render(<CommentActions status="Pending" onUpdateStatus={onUpdateStatus} />);
    fireEvent.click(screen.getByText("Approve"));
    expect(onUpdateStatus).toHaveBeenCalledWith("Approved");
  });

  it("calls onUpdateStatus with 'Rejected' when Reject is clicked", () => {
    const onUpdateStatus = vi.fn();
    render(<CommentActions status="Pending" onUpdateStatus={onUpdateStatus} />);
    fireEvent.click(screen.getByText("Reject"));
    expect(onUpdateStatus).toHaveBeenCalledWith("Rejected");
  });

  it("applies flex-1 class to buttons when fullWidth is true", () => {
    render(<CommentActions status="Pending" onUpdateStatus={vi.fn()} fullWidth />);
    const approveButton = screen.getByText("Approve");
    expect(approveButton.className).toContain("flex-1");
  });

  it("does not apply flex-1 class to buttons when fullWidth is false", () => {
    render(<CommentActions status="Pending" onUpdateStatus={vi.fn()} />);
    const approveButton = screen.getByText("Approve");
    expect(approveButton.className).not.toContain("flex-1");
  });
});
