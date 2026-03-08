/**
 * Admin comments page.
 * Displays comments with approve/reject functionality.
 */
import { cookies } from "next/headers";
import { requireAdmin } from "@/app/lib/auth";
import { api } from "@/app/lib/api";
import CommentsClient from "./client";

interface Comment {
  id: string;
  post_slug: string;
  user_id: string;
  user_name?: string;
  email?: string;
  body: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

async function getComments(): Promise<Comment[]> {
  // Get session cookie to pass to backend
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  // Call backend to get all comments
  const response = await fetch(api.admin.comments(), {
    headers: {
      Cookie: sessionCookie ? `sessionId=${sessionCookie.value}` : "",
    },
    cache: "no-store", // Ensure fresh data
  });

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export default async function AdminCommentsPage() {
  // Verify auth server-side - throws if not authenticated
  await requireAdmin();

  // Fetch comments server-side
  const comments = await getComments();

  // Render Client Component with data
  return <CommentsClient initialComments={comments} />;
}
