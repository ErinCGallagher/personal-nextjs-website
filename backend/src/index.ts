import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { globalLimiter } from "./rate-limiters";
import { errorHandler } from "./error-handler";
import postsRouter from "./routes/posts";
import adminRouter from "./routes/admin";
import searchRouter from "./routes/search";
import pool from "./db";

const app = express();
const port = process.env.PORT || 3001;
app.set("trust proxy", 1); // provide ip for rate limiting

app.use(helmet());
app.use(globalLimiter);
// Supports a comma-separated list of origins for multi-domain deployments
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(
  ",",
);
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "User-Agent"], // User-Agent required for better-auth 1.4+
}));
app.options("*", cors());

// Mount BetterAuth handler BEFORE express.json()
// This is critical or the client API will get stuck on 'pending'
app.all("/api/auth/*", toNodeHandler(auth));

// Apply express.json() after auth handler
app.use(express.json());

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

// Search routes: full-text search across blog posts
app.use("/api/search", searchRouter);

app.use(errorHandler);

// Skips starting the server when running tests so supertest can import the app directly
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
