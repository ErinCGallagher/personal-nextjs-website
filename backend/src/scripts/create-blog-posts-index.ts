/**
 * Script to create the blog_posts Elasticsearch index with field mappings.
 * Deletes the existing index first if it exists (safe for local dev).
 * Run with: pnpm elastic:create-posts-index
 */

import "dotenv/config";
import { getElasticsearchClient } from "../services/elasticsearch.js";

const INDEX_NAME = "blog_posts";

async function main() {
  const es = getElasticsearchClient();

  const exists = await es.indices.exists({ index: INDEX_NAME });

  if (exists) {
    console.log(`Index "${INDEX_NAME}" already exists — deleting it.`);
    await es.indices.delete({ index: INDEX_NAME });
  }

  await es.indices.create({
    index: INDEX_NAME,
    mappings: {
      properties: {
        slug:        { type: "keyword" },
        title:       { type: "text", fields: { keyword: { type: "keyword" } } },
        summary:     { type: "text", analyzer: "english" },
        content:     { type: "text", analyzer: "english" },
        author:      { type: "keyword" },
        publishedAt: { type: "date" },
        tags:        { type: "keyword" },
        country:     { type: "keyword" },
        featured:    { type: "boolean" },
        readingTime: { type: "integer" },
        image:       { type: "keyword" },
        suggest:     { type: "completion" },
      },
    },
  });

  console.log(`Index "${INDEX_NAME}" created successfully.`);
}

main().catch((err) => {
  console.error("Failed to create index:", err);
  process.exit(1);
});
