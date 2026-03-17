/** Hook for fetching and managing engagement data (likes, comment count) for a blog post. */

import { useState, useEffect } from "react";
import { routes, apiFetch } from "@/app/lib/api";
import { getAnonymousId } from "@/app/lib/anonymous-id";

interface UseEngagementResult {
  likeCount: number | null;
  liked: boolean;
  commentCount: number;
  error: Error | null;
  toggleLike: () => void;
}

export function useEngagement(slug: string): UseEngagementResult {
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    apiFetch<{ likeCount: number; liked: boolean; commentCount: number }>(
      routes.posts.likes(slug, getAnonymousId())
    )
      .then((data) => {
        setLikeCount(data.likeCount);
        setLiked(data.liked);
        setCommentCount(data.commentCount || 0);
      })
      .catch((err: Error) => {
        console.error("[useEngagement] Error fetching engagement:", err);
        setError(err);
      });
  }, [slug]);

  function toggleLike() {
    const nowLiked = !liked;
    setLiked(nowLiked);
    setLikeCount((c) => (c ?? 0) + (nowLiked ? 1 : -1));

    apiFetch<{ count: number; liked: boolean }>(routes.posts.like(slug), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymous_id: getAnonymousId() }),
    })
      .then((data) => {
        setLikeCount(data.count);
        setLiked(data.liked);
      })
      .catch((err: Error) => {
        console.error("[useEngagement] Error toggling like:", err);
        setError(err);
      });
  }

  return { likeCount, liked, commentCount, error, toggleLike };
}
