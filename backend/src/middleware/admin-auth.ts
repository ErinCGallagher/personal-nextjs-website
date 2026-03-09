/**
 * Admin authentication middleware.
 * Protects admin routes by checking if user is authenticated via BetterAuth.
 */
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log("[requireAdmin] Checking auth for:", req.method, req.path);
    console.log("[requireAdmin] Headers:", {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
    });

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    console.log("[requireAdmin] Session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userRole: session?.user?.role,
      userId: session?.user?.id,
    });

    if (session?.user && session.user.role === "admin") {
      console.log("[requireAdmin] Auth successful for user:", session.user.email);
      next();
    } else {
      console.log("[requireAdmin] Auth failed - no valid admin session");
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("[requireAdmin] Error during auth check:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
