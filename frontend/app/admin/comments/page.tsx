/**
 * Admin comments page.
 * Displays comments with approve/reject functionality.
 */
import CommentsClient from "./client";

export default function AdminCommentsPage() {
  // Client component will fetch data with cookies via credentials: "include"
  // Server-side fetch doesn't work with cross-domain cookies
  return <CommentsClient initialComments={[]} />;
}
