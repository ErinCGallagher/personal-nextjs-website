/**
 * Comments sidebar that slides in from the right.
 * Displays approved comments and allows users to add new ones.
 */
"use client";

import { useState, useEffect } from "react";
import { useComments } from "@/app/lib/hooks/useComments";

const COMMENT_PREVIEW_LENGTH = 200;
const SUCCESS_MESSAGE_TIMEOUT_MS = 15000;
import { FaTimes } from "react-icons/fa";
import { CommentForm } from "./comment-form";
import {
  getInitials,
  getAvatarColor,
  formatCommentDate,
} from "./comment-helpers";

interface Props {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsSidebar({ slug, isOpen, onClose }: Props) {
  const { comments, loading, refetch } = useComments(slug);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when sidebar is closed
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, refetch]);

  function handleCommentSuccess() {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), SUCCESS_MESSAGE_TIMEOUT_MS);
  }

  function toggleCommentExpansion(commentId: string) {
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

  function isCommentLong(text: string): boolean {
    // Consider a comment long if it exceeds the preview length or has multiple lines
    return text.length > COMMENT_PREVIEW_LENGTH || text.split("\n").length > 3;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Comments ({comments.length})
          </h2>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <p className="text-sm text-green-800">
              Comment submitted successfully! It will appear after admin
              approval.
            </p>
          </div>
        )}

        {/* New Comment Form */}
        <CommentForm
          slug={slug}
          onCancel={onClose}
          onSuccess={handleCommentSuccess}
        />

        {/* Comments List */}
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-0">
              {comments.map((comment, index) => {
                const isExpanded = expandedComments.has(comment.id);
                const isLong = isCommentLong(comment.body);

                return (
                  <div key={comment.id} className="pb-4">
                    <div className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: getAvatarColor(comment.user_id),
                        }}
                      >
                        {getInitials(comment.user_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {comment.user_name || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatCommentDate(comment.created_at)}
                          </span>
                        </div>
                        <p
                          className={`text-gray-800 whitespace-pre-wrap text-sm ${
                            !isExpanded && isLong ? "line-clamp-4" : ""
                          }`}
                        >
                          {comment.body}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleCommentExpansion(comment.id)}
                            className="mt-1 text-sm font-medium hover:opacity-70 transition-opacity"
                            style={{ color: "var(--grey-blue)" }}
                          >
                            {isExpanded ? "See less" : "See more"}
                          </button>
                        )}
                      </div>
                    </div>
                    {index < comments.length - 1 && (
                      <div className="mt-4 border-b border-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
