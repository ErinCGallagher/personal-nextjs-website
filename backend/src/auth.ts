/**
 * BetterAuth configuration for admin authentication.
 * Handles session management and email/password authentication.
 */
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

export const auth = betterAuth({
  database: new Pool({ connectionString }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      adminUserIds: [],
    }),
  ],
  trustedOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim()),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-secret-change-in-production",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.BASE_URL ||
    "http://localhost:3001",
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax", // Same-domain via proxy — lax is correct
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    },
  },
});
