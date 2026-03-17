/** Approve and Reject action buttons for a comment. */

"use client";

import { Comment } from "@/app/types/comment";

interface CommentActionsProps {
  status: Comment["status"];
  onUpdateStatus: (status: "Approved" | "Rejected") => void;
  /** When true, buttons expand to fill available width (for mobile card layout). */
  fullWidth?: boolean;
}

export default function CommentActions({
  status,
  onUpdateStatus,
  fullWidth = false,
}: CommentActionsProps) {
  const approveClass = fullWidth
    ? "flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
    : "px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors";
  const rejectClass = fullWidth
    ? "flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
    : "px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors";

  return (
    <>
      {status !== "Approved" && (
        <button onClick={() => onUpdateStatus("Approved")} className={approveClass}>
          Approve
        </button>
      )}
      {status !== "Rejected" && (
        <button onClick={() => onUpdateStatus("Rejected")} className={rejectClass}>
          Reject
        </button>
      )}
    </>
  );
}
