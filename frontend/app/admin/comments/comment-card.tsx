/** Mobile card for a single comment in the moderation panel. */

import { Comment } from "@/app/types/comment";
import { formatDateISO } from "@/app/lib/date-utils";
import CommentAIReview from "./comment-ai-review";
import CommentStatusBadge from "./comment-status-badge";
import CommentActions from "./comment-actions";

interface CommentCardProps {
  comment: Comment;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateStatus: (status: "Approved" | "Rejected") => void;
}

export default function CommentCard({
  comment,
  isExpanded,
  onToggleExpanded,
  onUpdateStatus,
}: CommentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {comment.user_name || "Anonymous"}
            </div>
            <div className="text-xs text-gray-500">{comment.email}</div>
          </div>
          <CommentStatusBadge status={comment.status} />
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Post</div>
          <div className="text-sm text-gray-900">{comment.post_slug}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Comment</div>
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

        {comment.latestAIReview && (
          <div>
            <div className="text-xs text-gray-500 mb-1">AI Review</div>
            <CommentAIReview review={comment.latestAIReview} />
          </div>
        )}

        <div className="text-xs text-gray-500">{formatDateISO(comment.created_at)}</div>

        <div className="flex gap-2 pt-2">
          <CommentActions status={comment.status} onUpdateStatus={onUpdateStatus} fullWidth />
        </div>
      </div>
    </div>
  );
}
