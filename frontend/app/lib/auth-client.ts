/**
 * BetterAuth client for authentication operations.
 * Used in client components for login, logout, and session management.
 */
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  plugins: [adminClient()],
});
