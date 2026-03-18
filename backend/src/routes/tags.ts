/**
 * Express router for tag aggregation endpoints.
 * Provides tag counts across all blog posts using Elasticsearch aggregations.
 */

import { Router } from "express";
import { getElasticsearchClient } from "../services/elasticsearch.js";
import { readLimiter } from "../rate-limiters.js";

const router = Router();

// GET /api/tags/aggregations
// Returns the top 20 tags by post count, sorted by count descending.
router.get("/aggregations", readLimiter, async (_req, res, next) => {
  try {
    const es = getElasticsearchClient();

    const response = await es.search({
      index: "blog_posts",
      // size: 0 fetches aggregations only — no document hits needed
      size: 0,
      query: { match_all: {} },
      aggs: {
        tags: {
          terms: {
            field: "tags",
            size: 20,
            order: { _count: "desc" },
          },
        },
      },
    });

    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total?.value ?? 0;

    type Bucket = { key: string; doc_count: number };
    const buckets =
      (response.aggregations?.tags as { buckets: Bucket[] })?.buckets ?? [];

    const tags = buckets.map((b) => ({ name: b.key, count: b.doc_count }));

    res.json({ total, tags });
  } catch (err) {
    next(err);
  }
});

export default router;
