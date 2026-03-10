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
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user && session.user.role === "admin") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("[requireAdmin] Error during auth check:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function requireAdminOrFamily(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user && (session.user.role === "admin" || session.user.role === "family")) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("[requireAdminOrFamily] Error during auth check:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
