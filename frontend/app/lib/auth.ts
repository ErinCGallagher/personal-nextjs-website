/**
 * Authentication utilities for Server Components and Server Actions.
 * Uses the Data Access Layer pattern to verify admin auth.
 */
import { cache } from "react";
import { getSession } from "./session";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return { isAdmin: true };
});

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorised");
  }
  return user;
}
