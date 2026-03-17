/**
 * Server-side authentication utilities for Next.js Server Components.
 * Used to check authentication status before rendering protected pages.
 * Uses the backend URL directly from server-side with forwarded cookies.
 */
import { cookies } from "next/headers";
import { routes, serverFetch } from "@/app/lib/api";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    return await serverFetch(routes.auth.session(), cookieHeader);
  } catch (error) {
    console.error("Error fetching server session:", error);
    return null;
  }
}

export async function requireAdmin() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    return { authorized: false, session: null };
  }

  return { authorized: true, session };
}
