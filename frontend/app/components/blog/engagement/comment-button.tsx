/**
 * Comment button for blog posts.
 * Displays the comment count and toggles the comments section visibility.
 */
"use client";

import { FaComment, FaRegComment } from "react-icons/fa";

interface Props {
  commentCount: number;
  showComments: boolean;
  onToggle: () => void;
}

export function CommentButton({ commentCount, showComments, onToggle }: Props) {
  const purple = "var(--grey-blue)";

  return (
    <button
      onClick={onToggle}
      aria-label={
        showComments ? "Hide comments" : `Show ${commentCount} comments`
      }
      className="flex items-center gap-2 text-sm"
      style={{ color: purple }}
    >
      <span className="relative flex items-center justify-center">
        {showComments ? (
          <FaComment className="text-2xl relative" style={{ color: purple }} />
        ) : (
          <FaRegComment
            className="text-2xl relative"
            style={{ color: purple }}
          />
        )}
      </span>
      <span>{commentCount}</span>
    </button>
  );
}
