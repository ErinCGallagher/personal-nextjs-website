import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalLimiter } from "./rate-limiters";
import { errorHandler } from "./error-handler";
import postsRouter from "./routes/posts";

const app = express();
const port = process.env.PORT || 3001;
app.set('trust proxy', 1); // provide ip for rate limiting

app.use(helmet());
app.use(globalLimiter);
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// GET /health
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Post routes: likes and comments on blog posts
app.use("/api/posts", postsRouter);

app.use(errorHandler);

// Skips starting the server when running tests so supertest can import the app directly
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
