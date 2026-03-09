import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import signature from "cookie-signature";
import { globalLimiter } from "./rate-limiters";
import { errorHandler } from "./error-handler";
import postsRouter from "./routes/posts";
import adminRouter from "./routes/admin";
import pool from "./db";

const app = express();
const port = process.env.PORT || 3001;
app.set("trust proxy", 1); // provide ip for rate limiting

const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool: pool,
  tableName: "session",
  createTableIfMissing: true,
  pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
});

app.use(helmet());
app.use(globalLimiter);
// Supports a comma-separated list of origins for multi-domain deployments
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(
  ",",
);
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// Middleware to extract session ID from header if present
app.use((req, res, next) => {
  const sessionIdHeader = req.headers["x-session-id"];
  if (sessionIdHeader && typeof sessionIdHeader === "string") {
    // Sign the session ID using the same secret as express-session
    const secret = process.env.SESSION_SECRET || "dev-secret-change-in-production";
    const signedSessionId = signature.sign(sessionIdHeader, secret);
    // Override cookie with signed value for session lookup
    req.headers.cookie = `sessionId=s:${signedSessionId}`;
  }
  next();
});

// Session configuration for admin authentication
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      // Allow cookie to be set from any origin when using proxy/rewrites
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  }),
);

// GET /health
// app.get("/health", (_req, res) => {
//   res.json({ status: "ok" });
// });

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err });
  }
});

// Post routes: likes and comments on blog posts
app.use("/api/posts", postsRouter);

// Admin routes: authentication and comment moderation
app.use("/api/admin", adminRouter);

app.use(errorHandler);

// Skips starting the server when running tests so supertest can import the app directly
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
