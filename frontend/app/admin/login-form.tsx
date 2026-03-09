/**
 * Client Component for admin login form.
 * Uses BetterAuth for authentication.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("[LoginForm] Starting login attempt for:", email);

    try {
      console.log("[LoginForm] Calling authClient.signIn.email");
      const { data, error: authError } = await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            console.log("[LoginForm] Login successful, redirecting to /admin/comments");
            router.push("/admin/comments");
          },
          onError: (ctx) => {
            console.error("[LoginForm] Auth error:", ctx.error);
            setError(ctx.error.message || "Login failed");
            setLoading(false);
          },
        }
      );

      console.log("[LoginForm] SignIn response:", {
        hasData: !!data,
        hasError: !!authError,
        user: data?.user,
        error: authError
      });

      if (authError) {
        console.error("[LoginForm] Auth error:", authError);
        setError(authError.message || "Login failed");
        setLoading(false);
        return;
      }

      if (data?.user && data.user.role !== "admin") {
        console.error("[LoginForm] User is not admin:", data?.user);
        setError("Unauthorized: Admin access required");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("[LoginForm] Exception during login:", err);
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={
            {
              "--tw-ring-color": "var(--grey-blue)",
            } as React.CSSProperties
          }
          placeholder="Enter your email"
          required
        />
      </div>

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
          placeholder="Enter your password"
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
