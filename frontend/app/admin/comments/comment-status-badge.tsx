/** Status pill badge for a comment (Approved / Rejected / Pending). */

import { Comment } from "@/app/types/comment";

interface CommentStatusBadgeProps {
  status: Comment["status"];
}

export default function CommentStatusBadge({ status }: CommentStatusBadgeProps) {
  const colorClass =
    status === "Approved"
      ? "bg-green-100 text-green-800"
      : status === "Rejected"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}
