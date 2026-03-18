/**
 * Rebuilds the blog_posts Elasticsearch index from scratch.
 * Deletes the existing index, recreates it with the current mapping,
 * then indexes all posts from MDX files.
 * Requires --force flag to confirm the destructive deletion step.
 * Run with: pnpm elastic:reindex -- --force
 */

import "dotenv/config";
import { createBlogPostsIndex } from "./create-blog-posts-index.js";
import { indexBlogPosts } from "./index-blog-posts.js";

function timestamp() {
  return new Date().toISOString();
}

async function main() {
  if (!process.argv.includes("--force")) {
    console.error("Error: --force flag required. This will delete and rebuild the blog_posts index.");
    console.error("Usage: pnpm elastic:reindex -- --force");
    process.exit(1);
  }

  console.log(`[${timestamp()}] Starting reindex...`);

  console.log(`[${timestamp()}] Step 1/2: Creating index...`);
  await createBlogPostsIndex();

  console.log(`[${timestamp()}] Step 2/2: Indexing posts...`);
  await indexBlogPosts();

  console.log(`[${timestamp()}] Reindex complete.`);
}

main().catch((err) => {
  console.error("Reindex failed:", err);
  process.exit(1);
});
