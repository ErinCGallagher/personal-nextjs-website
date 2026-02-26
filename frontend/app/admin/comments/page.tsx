/**
 * Admin comments page.
 * Displays comments with approve/reject functionality and AI review data.
 * Auth check happens client-side in CommentsClient component.
 */
import CommentsClient from "./client";

export default function AdminCommentsPage() {
  return <CommentsClient initialComments={[]} />;
}
