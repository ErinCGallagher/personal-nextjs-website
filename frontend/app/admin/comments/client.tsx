/**
 * Client Component for comment moderation UI.
 * Handles interactive filtering, expand/collapse, and mutations.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { authClient } from "@/app/lib/auth-client";

interface Comment {
  id: string;
  post_slug: string;
  user_id: string;
  user_name?: string;
  email?: string;
  body: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

interface CommentsClientProps {
  initialComments: Comment[];
}

export default function CommentsClient({ initialComments }: CommentsClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filter, setFilter] = useState<"" | "Pending" | "Approved" | "Rejected">("");
  const [postFilter, setPostFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const router = useRouter();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    console.log("[CommentsClient] Mounted, filter:", filter);
    console.log("[CommentsClient] Current cookies:", document.cookie);
    fetchComments();
  }, [filter]);

  async function fetchComments() {
    console.log("[CommentsClient] fetchComments called");
    setLoading(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const commentsUrl = backendUrl
        ? `${backendUrl}/api/admin/comments${filter ? `?status=${filter}` : ""}`
        : api.admin.comments(filter || undefined);

      console.log("[CommentsClient] Fetching from:", commentsUrl);
      console.log("[CommentsClient] Using backendUrl:", backendUrl);
      console.log("[CommentsClient] Cookies before fetch:", document.cookie);

      const response = await fetch(commentsUrl, {
        credentials: "include",
      });

      console.log("[CommentsClient] Response status:", response.status);
      console.log("[CommentsClient] Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log("[CommentsClient] Unauthorized, redirecting to /admin");
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        console.error("[CommentsClient] Response not OK:", response.status, response.statusText);
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      console.log("[CommentsClient] Successfully fetched comments:", data.length, "items");
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
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const updateUrl = backendUrl
        ? `${backendUrl}/api/admin/comments/${id}`
        : api.admin.updateComment(id);

      const response = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Filter comments based on both status and post filters
  const filteredComments = comments.filter((comment) => {
    const matchesPost = !postFilter || comment.post_slug === postFilter;
    return matchesPost;
  });

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

        {/* Status filter buttons */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === ""
                  ? "text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              style={
                filter === "" ? { backgroundColor: "var(--grey-blue)" } : undefined
              }
            >
              All
            </button>
            <button
              onClick={() => setFilter("Pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "Pending"
                  ? "text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              style={
                filter === "Pending"
                  ? { backgroundColor: "var(--grey-blue)" }
                  : undefined
              }
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("Approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "Approved"
                  ? "text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              style={
                filter === "Approved"
                  ? { backgroundColor: "var(--grey-blue)" }
                  : undefined
              }
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("Rejected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === "Rejected"
                  ? "text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              style={
                filter === "Rejected"
                  ? { backgroundColor: "var(--grey-blue)" }
                  : undefined
              }
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Post filter buttons */}
        {uniquePostSlugs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">
              Filter by Post
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setPostFilter("")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  postFilter === ""
                    ? "text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
                style={
                  postFilter === ""
                    ? { backgroundColor: "var(--grey-blue)" }
                    : undefined
                }
              >
                All Posts
              </button>
              {uniquePostSlugs.map((slug) => (
                <button
                  key={slug}
                  onClick={() => setPostFilter(slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    postFilter === slug
                      ? "text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                  style={
                    postFilter === slug
                      ? { backgroundColor: "var(--grey-blue)" }
                      : undefined
                  }
                >
                  {slug}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {comment.user_name || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {comment.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {comment.post_slug}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <div
                            className={`text-sm text-gray-900 ${
                              expandedComments.has(comment.id) ? "" : "line-clamp-3"
                            }`}
                          >
                            {comment.body}
                          </div>
                          {comment.body.length > 150 && (
                            <button
                              onClick={() => toggleExpanded(comment.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              {expandedComments.has(comment.id) ? "See less" : "See more"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            comment.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : comment.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {comment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {comment.status !== "Approved" && (
                          <button
                            onClick={() => updateStatus(comment.id, "Approved")}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {comment.status !== "Rejected" && (
                          <button
                            onClick={() => updateStatus(comment.id, "Rejected")}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-4">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg shadow p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {comment.user_name || "Anonymous"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {comment.email}
                        </div>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          comment.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : comment.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {comment.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Post</div>
                      <div className="text-sm text-gray-900">{comment.post_slug}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Comment</div>
                      <div
                        className={`text-sm text-gray-900 ${
                          expandedComments.has(comment.id) ? "" : "line-clamp-3"
                        }`}
                      >
                        {comment.body}
                      </div>
                      {comment.body.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(comment.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          {expandedComments.has(comment.id) ? "See less" : "See more"}
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {comment.status !== "Approved" && (
                        <button
                          onClick={() => updateStatus(comment.id, "Approved")}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          Approve
                        </button>
                      )}
                      {comment.status !== "Rejected" && (
                        <button
                          onClick={() => updateStatus(comment.id, "Rejected")}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
