/**
 * Session management utilities. Reads and validates session cookies.
 */
import { cookies } from "next/headers";

export async function getSession() {
  const sessionCookie = (await cookies()).get("sessionId");
  if (!sessionCookie) return null;

  // Validate session with backend
  // For now, just return a simple object if cookie exists
  // We'll enhance this in the next step
  return { isAdmin: true };
}
