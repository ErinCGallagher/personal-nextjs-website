/** Hook for fetching approved comments for a blog post. */

import { useState, useCallback } from "react";
import { routes, apiFetch } from "@/app/lib/api";
import { Comment } from "@/app/types/comment";

interface UseCommentsResult {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useComments(slug: string): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<Comment[]>(routes.posts.comments(slug))
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setComments(sorted);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("[useComments] Error fetching comments:", err);
        setError(err);
        setLoading(false);
      });
  }, [slug]);

  return { comments, loading, error, refetch };
}
