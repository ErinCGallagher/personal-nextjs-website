/** Desktop table row for a single comment in the moderation panel. */

import { Comment } from "@/app/types/comment";
import { formatDateISO } from "@/app/lib/date-utils";
import CommentAIReview from "./comment-ai-review";
import CommentStatusBadge from "./comment-status-badge";
import CommentActions from "./comment-actions";

interface CommentRowProps {
  comment: Comment;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateStatus: (status: "Approved" | "Rejected") => void;
}

export default function CommentRow({
  comment,
  isExpanded,
  onToggleExpanded,
  onUpdateStatus,
}: CommentRowProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {comment.user_name || "Anonymous"}
        </div>
        <div className="text-sm text-gray-500">{comment.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {comment.post_slug}
      </td>
      <td className="px-6 py-4">
        <div className="max-w-md">
          <div className={`text-sm text-gray-900 ${isExpanded ? "" : "line-clamp-3"}`}>
            {comment.body}
          </div>
          {comment.body.length > 150 && (
            <button
              onClick={onToggleExpanded}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <CommentAIReview review={comment.latestAIReview} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CommentStatusBadge status={comment.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDateISO(comment.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <CommentActions status={comment.status} onUpdateStatus={onUpdateStatus} />
      </td>
    </tr>
  );
}
