/**
 * Admin comments page.
 * Displays comments with approve/reject functionality.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";

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

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<"" | "Pending" | "Approved" | "Rejected">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [filter]);

  async function fetchComments() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(api.admin.comments(filter || undefined), {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "Approved" | "Rejected") {
    try {
      const response = await fetch(api.admin.updateComment(id), {
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
      await fetch(api.admin.logout(), {
        method: "POST",
        credentials: "include",
      });
      router.push("/admin");
    } catch (err) {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Comment Moderation
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500">No comments found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {comments.map((comment) => (
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
                      <div className="text-sm text-gray-900 max-w-md line-clamp-3">
                        {comment.body}
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
                      {new Date(comment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {comment.status !== "Approved" && (
                        <button
                          onClick={() => updateStatus(comment.id, "Approved")}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      )}
                      {comment.status !== "Rejected" && (
                        <button
                          onClick={() => updateStatus(comment.id, "Rejected")}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </div>
    </div>
  );
}
