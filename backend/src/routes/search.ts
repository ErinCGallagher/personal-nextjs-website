/**
 * Express router for blog post search endpoints.
 * Uses Elasticsearch to provide full-text search across blog post content.
 */

import { Router } from "express";
import { z } from "zod";
import { getElasticsearchClient } from "../services/elasticsearch.js";
import { validateRequest } from "../middleware/validate.js";
import { searchQuerySchema, suggestQuerySchema } from "../schemas.js";
import { readLimiter } from "../rate-limiters.js";

const router = Router();

// GET /api/search?q=yellowstone&limit=10
// Returns blog posts matching the query, sorted by relevance score
router.get("/", readLimiter, validateRequest(searchQuerySchema), async (_req, res, next) => {
  try {
    const { q, limit } = res.locals.validated as z.infer<typeof searchQuerySchema>;
    const es = getElasticsearchClient();

    const response = await es.search({
      index: "blog_posts",
      size: limit,
      query: {
        multi_match: {
          query: q,
          fields: ["title", "summary", "content", "country"],
          // Require all query terms to be present — prevents single common words
          // (e.g. "south" in "south africa") from matching unrelated posts.
          operator: "and",
        },
      },
      _source: ["slug", "title", "summary", "tags", "country", "publishedAt"],
    });

    const results = response.hits.hits.map((hit) => ({
      ...(hit._source as object),
      score: hit._score,
    }));

    res.json({
      query: q,
      total: typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total?.value ?? 0,
      results,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/search/suggest?q=yell
// Returns up to 5 completion suggestions from post titles and tags.
router.get("/suggest", readLimiter, validateRequest(suggestQuerySchema), async (_req, res, next) => {
  try {
    const { q } = res.locals.validated as z.infer<typeof suggestQuerySchema>;
    const es = getElasticsearchClient();

    const response = await es.search({
      index: "blog_posts",
      suggest: {
        post_suggest: {
          prefix: q,
          completion: { field: "suggest", size: 5, skip_duplicates: true },
        },
      },
      _source: false,
    });

    type SuggestOption = { text: string; _score: number };
    const options = (response.suggest?.post_suggest?.[0]?.options ?? []) as SuggestOption[];

    const seen = new Set<string>();
    const suggestions = options
      .filter((o) => !seen.has(o.text) && seen.add(o.text))
      .map((o) => ({ text: o.text, score: o._score }));

    res.json({ query: q, suggestions });
  } catch (err) {
    next(err);
  }
});

export default router;
