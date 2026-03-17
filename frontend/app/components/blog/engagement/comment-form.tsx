/**
 * Comment form for submitting new comments.
 * Handles validation and submission to the backend API.
 */
"use client";

import React, { useState } from "react";
import { api } from "@/app/lib/api";
import { getAnonymousId } from "@/app/lib/anonymous-id";

const NAME_MAX_LENGTH = 100;
const BODY_MAX_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  slug: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function CommentForm({ slug, onCancel, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    body?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  function validateForm(): boolean {
    const newErrors: { name?: string; email?: string; body?: string } = {};

    // Name validation: required, max NAME_MAX_LENGTH chars
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.length > NAME_MAX_LENGTH) {
      newErrors.name = `Name must be ${NAME_MAX_LENGTH} characters or less`;
    }

    // Email validation: required, valid email format
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Body validation: required, max BODY_MAX_LENGTH chars
    if (!body.trim()) {
      newErrors.body = "Comment cannot be empty";
    } else if (body.length > BODY_MAX_LENGTH) {
      newErrors.body = `Comment must be ${BODY_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNameChange(value: string) {
    setName(value);
    // Clear error if field is now valid
    if (errors.name) {
      if (value.trim() && value.length <= NAME_MAX_LENGTH) {
        setErrors((prev) => ({ ...prev, name: undefined }));
      }
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    // Clear error if field is now valid
    if (errors.email) {
      if (value.trim() && EMAIL_REGEX.test(value)) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
  }

  function handleBodyChange(value: string) {
    setBody(value);
    // Clear error if field is now valid
    if (errors.body) {
      if (value.trim() && value.length <= BODY_MAX_LENGTH) {
        setErrors((prev) => ({ ...prev, body: undefined }));
      }
    }
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch(api.posts.comment(slug), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous_id: getAnonymousId(),
          name: name.trim(),
          email: email.trim(),
          body: body.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      // Clear form on success
      setName("");
      setEmail("");
      setBody("");
      setErrors({});
      onSuccess();
    } catch (error) {
      setErrors({ body: "Failed to submit comment. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 border-b bg-gray-50">
      <div className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={NAME_MAX_LENGTH}
            disabled={submitting}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            style={
              !errors.name
                ? {
                    "--tw-ring-color": "var(--grey-blue)",
                  } as React.CSSProperties
                : undefined
            }
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={submitting}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            style={
              !errors.email
                ? {
                    "--tw-ring-color": "var(--grey-blue)",
                  } as React.CSSProperties
                : undefined
            }
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Write a comment..."
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            maxLength={BODY_MAX_LENGTH}
            rows={4}
            disabled={submitting}
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.body
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            style={
              !errors.body
                ? {
                    "--tw-ring-color": "var(--grey-blue)",
                  } as React.CSSProperties
                : undefined
            }
          />
          <div className="flex justify-between items-start mt-1">
            {errors.body && (
              <p className="text-xs text-red-600">{errors.body}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {body.length}/{BODY_MAX_LENGTH}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          All comments will be approved by an admin before posting. Approval
          within 48 hours.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--grey-blue)" }}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
