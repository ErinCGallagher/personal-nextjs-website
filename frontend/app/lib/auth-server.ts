/**
 * Server-side authentication utilities for Next.js Server Components.
 * Used to check authentication status before rendering protected pages.
 */
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
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
