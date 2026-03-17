/**
 * Engagement buttons wrapper for blog posts.
 * Fetches engagement data (likes and comment count) and manages state for both LikeButton and CommentButton.
 */
"use client";

import { useState } from "react";
import { useEngagement } from "@/app/lib/hooks/useEngagement";
import { FaHeart, FaRegHeart, FaComment, FaRegComment } from "react-icons/fa";
import { CommentsSidebar } from "./comments-sidebar";

interface Props {
  slug: string;
}

export function EngagementButtons({ slug }: Props) {
  const { likeCount, liked, commentCount, toggleLike } = useEngagement(slug);
  const [pulsing, setPulsing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  function handleLike() {
    if (!liked) setPulsing(true);
    toggleLike();
  }

  function handleToggleComments() {
    setShowComments(!showComments);
  }

  if (likeCount === null) return null;

  const purple = "var(--grey-blue)";

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          aria-label={liked ? "Unlike this post" : "Like this post"}
          className="flex items-center gap-2 text-sm"
          style={{ color: purple }}
        >
          <span className="relative flex items-center justify-center">
            {pulsing && (
              <span
                className="like-pulse absolute inset-0 rounded-full"
                style={{ backgroundColor: purple }}
                onAnimationEnd={() => setPulsing(false)}
              />
            )}
            {liked ? (
              <FaHeart className="text-2xl relative" style={{ color: purple }} />
            ) : (
              <FaRegHeart
                className="text-2xl relative"
                style={{ color: purple }}
              />
            )}
          </span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          aria-label={
            showComments ? "Hide comments" : `Show ${commentCount} comments`
          }
          className="flex items-center gap-2 text-sm"
          style={{ color: purple }}
        >
          <span className="relative flex items-center justify-center">
            {showComments ? (
              <FaComment
                className="text-2xl relative"
                style={{ color: purple }}
              />
            ) : (
              <FaRegComment
                className="text-2xl relative"
                style={{ color: purple }}
              />
            )}
          </span>
          <span>{commentCount}</span>
        </button>
      </div>

      <CommentsSidebar
        slug={slug}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}
