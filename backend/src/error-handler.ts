/**
 * Express error handling middleware.
 *
 * Client errors (4xx) return the actual error message so callers can act on it.
 * Server errors (5xx) return a generic message but log the full stack so the
 * cause is visible in server logs without leaking internals to the client.
 */
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status =
    "status" in err && typeof err.status === "number" ? err.status : 500;

  if (status >= 500) {
    console.error(err.stack ?? err.message);
    res.status(status).json({ error: "Internal server error" });
  } else {
    res.status(status).json({ error: err.message });
  }
}
