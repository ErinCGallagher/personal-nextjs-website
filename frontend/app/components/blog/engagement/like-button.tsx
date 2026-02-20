/**
 * Like button for blog posts.
 *
 * Fetches the current like count and liked state on mount, identified by a
 * UUID persisted in localStorage. Allows anonymous users to toggle a like.
 * UI updates optimistically on click; the backend is synced in the background.
 */
"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { api } from "@/app/lib/api";

// Persisted in localStorage until browser data is cleared. Used for casual
// deduplication without requiring a login.
function getAnonymousId(): string {
  let id = localStorage.getItem("anonymous_id");
  if (!id) {
    id = crypto.randomUUID(); // generates a UUID v4
    localStorage.setItem("anonymous_id", id);
  }
  return id;
}

interface Props {
  slug: string;
}

export function LikeButton({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    fetch(api.posts.likes(slug, getAnonymousId()))
      .then((res) => res.json())
      .then((data) => {
        setCount(data.likeCount);
        setLiked(data.liked);
      })
      .catch(() => {});
  }, [slug]);

  function handleLike() {
    const nowLiked = !liked;

    // Optimistically update UI before hearing back from the backend
    setLiked(nowLiked);
    setCount((c) => (c ?? 0) + (nowLiked ? 1 : -1));
    if (nowLiked) setPulsing(true);

    fetch(api.posts.like(slug), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymous_id: getAnonymousId() }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count);
        setLiked(data.liked);
      })
      .catch(() => {});
  }

  if (count === null) return null;

  const purple = "var(--grey-blue)";

  return (
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
          <FaRegHeart className="text-2xl relative" style={{ color: purple }} />
        )}
      </span>
      {count !== null && <span>{count}</span>}
    </button>
  );
}
