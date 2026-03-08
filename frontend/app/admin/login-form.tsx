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

    const response = await fetch(api.admin.login(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // browser → Express directly, so this works
      body: JSON.stringify({ password: formData.get("password") }),
    });

    if (response.ok) {
      router.push("/admin/comments");
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
