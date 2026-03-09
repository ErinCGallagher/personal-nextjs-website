/**
 * Admin comments page.
 * Displays comments with approve/reject functionality.
 */
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth-server";
import CommentsClient from "./client";

export default async function AdminCommentsPage() {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    redirect("/admin");
  }

  return <CommentsClient initialComments={[]} />;
}
