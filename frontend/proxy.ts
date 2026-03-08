/**
 * Next.js proxy for admin routes.
 * Redirects unauthenticated users to /admin (login page) for better UX.
 *
 * IMPORTANT: This is NOT a security layer. It can be bypassed via header spoofing
 * (CVE-2025-29927). All Server Components and Server Actions must call requireAdmin()
 * to verify auth at the data access layer.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("sessionId");

  // Redirect to login if no session cookie
  if (!sessionCookie && request.nextUrl.pathname !== "/admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path+"], // Matches /admin/* but not /admin itself
};
