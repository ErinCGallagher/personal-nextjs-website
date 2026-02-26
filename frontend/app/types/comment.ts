/**
 * Type definitions for comments and AI reviews.
 * Matches the backend API response structure.
 */

export interface AIReviewData {
  id: string;
  provider: string;
  status: "completed" | "error" | "pending";
  confidence_score: number | null;
  flags: string[] | null;
  reasoning: string | null;
  error_message: string | null;
  reviewed_at: string | null;
  api_response_time_ms: number | null;
}

export interface Comment {
  id: string;
  post_slug: string;
  parent_id: string | null;
  user_id: string;
  user_name?: string;
  email?: string;
  body: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  status_updated_at: string | null;
  status_updated_by: string | null;
  latest_ai_review_id: string | null;
  latestAIReview?: AIReviewData | null;
}
