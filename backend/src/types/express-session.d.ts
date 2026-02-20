/**
 * Extends express-session types to include custom session data.
 */
import "express-session";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}
