/**
 * Admin authentication middleware.
 * Protects admin routes by checking if user is authenticated via session.
 */
import { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log("Session check:", {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    isAdmin: req.session?.isAdmin,
    cookie: req.session?.cookie,
  });

  if (req.session?.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}
