/**
 * Client Component for comment moderation UI.
 * Handles interactive filtering, expand/collapse, and mutations.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { useAdminAuth } from "@/app/lib/hooks/useAdminAuth";
import { Comment } from "@/app/types/comment";
import CommentFilters, { StatusFilter } from "./comment-filters";
import CommentRow from "./comment-row";
import CommentCard from "./comment-card";

interface CommentsClientProps {
  initialComments: Comment[];
}

export default function CommentsClient({ initialComments }: CommentsClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filter, setFilter] = useState<StatusFilter>("");
  const [postFilter, setPostFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { role } = useAdminAuth();

  useEffect(() => {
    if (role === "family") {
      router.push("/admin/travel");
    }
  }, [role, router]);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  async function fetchComments() {
    setLoading(true);
    setError("");

    try {
      const commentsUrl = `/api/admin/comments${filter ? `?status=${filter}` : ""}`;

      const response = await fetch(commentsUrl, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        console.error("[CommentsClient] Response not OK:", response.status, response.statusText);
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("[CommentsClient] Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "Approved" | "Rejected") {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (response.ok) {
        // Refresh comments list
        fetchComments();
      } else {
        alert("Failed to update comment");
      }
    } catch (err) {
      alert("Failed to update comment");
    }
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
      router.push("/admin");
    } catch (err) {
      router.push("/admin");
    }
  }

  function toggleExpanded(commentId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }

  // Extract unique post slugs from comments
  const uniquePostSlugs = Array.from(
    new Set(comments.map((comment) => comment.post_slug))
  ).sort();

  // Filter comments based on post filter (status filter is applied server-side via API)
  const filteredComments = comments.filter(
    (comment) => !postFilter || comment.post_slug === postFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Comment Moderation
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/admin/travel")}
              className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Travel
            </button>
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <CommentFilters
          filter={filter}
          postFilter={postFilter}
          uniquePostSlugs={uniquePostSlugs}
          onStatusChange={setFilter}
          onPostChange={setPostFilter}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="text-gray-500">Loading comments...</div>
        ) : filteredComments.length === 0 ? (
          <div className="text-gray-500">No comments found</div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Author", "Post", "Comment", "AI Review", "Status", "Date", "Actions"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComments.map((comment) => (
                    <CommentRow
                      key={comment.id}
                      comment={comment}
                      isExpanded={expandedComments.has(comment.id)}
                      onToggleExpanded={() => toggleExpanded(comment.id)}
                      onUpdateStatus={(status) => updateStatus(comment.id, status)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-4">
              {filteredComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isExpanded={expandedComments.has(comment.id)}
                  onToggleExpanded={() => toggleExpanded(comment.id)}
                  onUpdateStatus={(status) => updateStatus(comment.id, status)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
