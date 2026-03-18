/**
 * Script to create the blog_posts Elasticsearch index with field mappings.
 * Deletes the existing index first if it exists (safe for local dev).
 * Run with: pnpm elastic:create-posts-index
 */

import "dotenv/config";
import { getElasticsearchClient } from "../services/elasticsearch.js";

const INDEX_NAME = "blog_posts";

export async function createBlogPostsIndex() {
  const es = getElasticsearchClient();

  const { body: exists } = await es.indices.exists({ index: INDEX_NAME });

  if (exists) {
    console.log(`Index "${INDEX_NAME}" already exists — deleting it.`);
    await es.indices.delete({ index: INDEX_NAME });
  }

  await es.indices.create({
    index: INDEX_NAME,
    body: {
      mappings: {
        properties: {
          slug:        { type: "keyword" },
          // standard analyser preserves capitalisation and avoids over-stemming travel terms
          // (e.g. "Nile" → "nil" with English analyser). summary/content still use English
          // for better stemming on prose text.
          title:       { type: "text", analyzer: "standard", fields: { keyword: { type: "keyword" } } },
          summary:     { type: "text", analyzer: "english" },
          content:     { type: "text", analyzer: "english" },
          // index: false — never queried directly, stored only for display
          author:      { type: "keyword", index: false },
          publishedAt: { type: "date" },
          tags:        { type: "keyword" },
          country:     { type: "keyword" },
          featured:    { type: "boolean" },
          readingTime: { type: "integer" },
          // index: false — never queried directly, stored only for display
          image:       { type: "keyword", index: false },
          suggest:     { type: "completion" },
        },
      },
    },
  });

  console.log(`Index "${INDEX_NAME}" created successfully.`);
}

if (process.argv[1] === __filename) {
  createBlogPostsIndex().catch((err) => {
    console.error("Failed to create index:", err);
    process.exit(1);
  });
}
