/**
 * Client Component for admin login form.
 * Handles form state and calls loginAction Server Action.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // In production, bypass the Next.js rewrite and call Railway directly
    // This ensures the Set-Cookie header has the correct domain
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const loginUrl = backendUrl ? `${backendUrl}/api/admin/login` : api.admin.login();

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Essential for cross-origin cookies
      body: JSON.stringify({ password: formData.get("password") }),
    });

    if (response.ok) {
      // Use full page reload instead of client-side navigation
      // This ensures the cookie is available to server components
      window.location.href = "/admin/comments";
    } else {
      const data = await response.json();
      setError(data.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={
            {
              "--tw-ring-color": "var(--grey-blue)",
            } as React.CSSProperties
          }
          placeholder="Enter admin password"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "var(--grey-blue)" }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
