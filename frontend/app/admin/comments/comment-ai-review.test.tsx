/** Tests for CommentAIReview component */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentAIReview from "./comment-ai-review";
import type { AIReviewData } from "@/app/types/comment";

const baseReview: AIReviewData = {
  id: "review-1",
  provider: "claude",
  status: "completed",
  confidence_score: null,
  flags: null,
  reasoning: null,
  error_message: null,
  reviewed_at: null,
  api_response_time_ms: null,
};

describe("CommentAIReview", () => {
  it("renders 'No review' when review is null", () => {
    render(<CommentAIReview review={null} />);
    expect(screen.getByText("No review")).toBeTruthy();
  });

  it("renders 'No review' when review is undefined", () => {
    render(<CommentAIReview review={undefined} />);
    expect(screen.getByText("No review")).toBeTruthy();
  });

  it("renders confidence score as a percentage", () => {
    render(<CommentAIReview review={{ ...baseReview, confidence_score: 0.85 }} />);
    expect(screen.getByText("85%")).toBeTruthy();
  });

  it("does not render confidence section when score is null", () => {
    render(<CommentAIReview review={baseReview} />);
    expect(screen.queryByText("Confidence:")).toBeNull();
  });

  it("renders flags when present", () => {
    render(<CommentAIReview review={{ ...baseReview, flags: ["spam", "offensive"] }} />);
    expect(screen.getByText("spam, offensive")).toBeTruthy();
  });

  it("does not render flags section when flags are empty", () => {
    render(<CommentAIReview review={{ ...baseReview, flags: [] }} />);
    expect(screen.queryByText("Flags:")).toBeNull();
  });

  it("renders reasoning when present", () => {
    render(<CommentAIReview review={{ ...baseReview, reasoning: "Looks legitimate." }} />);
    expect(screen.getByText("Looks legitimate.")).toBeTruthy();
  });

  it("renders error message when present", () => {
    render(<CommentAIReview review={{ ...baseReview, error_message: "Timeout" }} />);
    expect(screen.getByText(/Timeout/)).toBeTruthy();
  });

  it("applies green background when confidence is 0.9 or above", () => {
    const { container } = render(
      <CommentAIReview review={{ ...baseReview, confidence_score: 0.95 }} />
    );
    expect(container.firstChild).toHaveProperty(
      "className",
      expect.stringContaining("bg-green-50")
    );
  });

  it("applies red background when confidence is below 0.9", () => {
    const { container } = render(
      <CommentAIReview review={{ ...baseReview, confidence_score: 0.5 }} />
    );
    expect(container.firstChild).toHaveProperty(
      "className",
      expect.stringContaining("bg-red-50")
    );
  });
});
