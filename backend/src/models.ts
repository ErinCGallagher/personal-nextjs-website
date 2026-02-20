/**
 * Shared database model type definitions.
 * These types represent the structure of data returned from database queries.
 */

export enum CommentStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
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
}
