/**
 * Shared database model type definitions.
 * These types represent the structure of data returned from database queries.
 */

export enum CommentStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  flight: string | null;
  rental_car: string | null;
  notes: string | null;
}

export enum AIReviewStatus {
  Completed = "completed",
  Error = "error",
  Pending = "pending",
}

export interface AICommentReview {
  id: string;
  comment_id: string;
  provider: string;
  confidence_score: number | null;
  flags: string[] | null;
  reasoning: string | null;
  status: AIReviewStatus;
  error_message: string | null;
  reviewed_at: Date | null;
  api_response_time_ms: number | null;
  created_at: Date;
}
export interface CommentRow {
  id: string;
  post_slug: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  status: CommentStatus;
  created_at: Date;
  status_updated_at: Date | null;
  status_updated_by: string | null;
  user_name?: string;
  latest_ai_review_id: string | null;
  latestAIReview?: AICommentReview | null;
}
