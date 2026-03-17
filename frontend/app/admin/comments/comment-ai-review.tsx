/** Displays AI review details for a comment. */

import { AIReviewData } from "@/app/types/comment";

interface CommentAIReviewProps {
  review: AIReviewData | null | undefined;
}

export default function CommentAIReview({ review }: CommentAIReviewProps) {
  if (!review) {
    return <span className="text-sm text-gray-400">No review</span>;
  }

  const bgClass =
    review.confidence_score !== null && review.confidence_score >= 0.9
      ? "bg-green-50"
      : review.confidence_score !== null
      ? "bg-red-50"
      : "";

  return (
    <div className={`text-sm space-y-1 p-2 rounded ${bgClass}`}>
      {review.confidence_score !== null && (
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Confidence:</span>
          <span className="font-semibold text-gray-900">
            {(review.confidence_score * 100).toFixed(0)}%
          </span>
        </div>
      )}
      {review.flags && review.flags.length > 0 && (
        <div>
          <span className="text-gray-600 font-medium">Flags: </span>
          <span className="text-xs text-red-700">{review.flags.join(", ")}</span>
        </div>
      )}
      {review.reasoning && (
        <div className="max-w-xs">
          <span className="text-gray-600 font-medium">Reasoning: </span>
          <span className="text-xs text-gray-700">{review.reasoning}</span>
        </div>
      )}
      {review.error_message && (
        <div className="text-xs text-red-600">Error: {review.error_message}</div>
      )}
    </div>
  );
}
