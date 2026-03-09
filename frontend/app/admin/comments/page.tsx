/**
 * Admin comments page.
 * Displays comments with approve/reject functionality.
 * Auth check happens client-side in CommentsClient component.
 */
import CommentsClient from "./client";

export default function AdminCommentsPage() {
  return <CommentsClient initialComments={[]} />;
}
