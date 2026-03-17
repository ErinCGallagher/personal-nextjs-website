/**
 * Engagement buttons wrapper for blog posts.
 * Fetches engagement data (likes and comment count) and manages state for both LikeButton and CommentButton.
 */
"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { FaHeart, FaRegHeart, FaComment, FaRegComment } from "react-icons/fa";
import { CommentsSidebar } from "./comments-sidebar";
import { getAnonymousId } from "@/app/lib/anonymous-id";

interface Props {
  slug: string;
}

export function EngagementButtons({ slug }: Props) {
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showComments, setShowComments] = useState(false);


  // GET Likes Request (fetches comment count too)
  useEffect(() => {
    fetch(api.posts.likes(slug, getAnonymousId()))
      .then((res) => res.json())
      .then((data) => {
        setLikeCount(data.likeCount);
        setLiked(data.liked);
        setCommentCount(data.commentCount || 0);
      })
      .catch(() => {});
  }, [slug]);

  function handleLike() {
    const nowLiked = !liked;

    setLiked(nowLiked);
    setLikeCount((c) => (c ?? 0) + (nowLiked ? 1 : -1));
    if (nowLiked) setPulsing(true);
    
    // POST Like request sent to update like state
    fetch(api.posts.like(slug), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymous_id: getAnonymousId() }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLikeCount(data.count);
        setLiked(data.liked);
      })
      .catch(() => {});
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
