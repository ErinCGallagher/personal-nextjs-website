/**
 * BetterAuth client for authentication operations.
 * Used in client components for login, logout, and session management.
 * Uses Next.js rewrites to proxy requests to backend, ensuring cookies work cross-domain.
 */
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Don't set baseURL - use same domain to leverage Next.js rewrites
  // This ensures cookies are set on the frontend domain
  plugins: [adminClient()],
});
