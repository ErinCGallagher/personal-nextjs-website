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

// GET /api/search?q=yellowstone&tags=Hiking&tags=Safari&limit=10
// Supports text-only, tags-only, or combined queries. At least one of q or tags is required.
router.get("/", readLimiter, validateRequest(searchQuerySchema), async (_req, res) => {
  try {
    const { q, limit, tags } = res.locals.validated as z.infer<typeof searchQuerySchema>;
    const es = getElasticsearchClient();

    const textClause = q
      ? {
          multi_match: {
            query: q,
            // Title matches are most valuable; summary next; country/content fill out results.
            fields: ["title^3", "summary^2", "content", "country"],
            // Require 75% of query terms to match — more flexible than operator:"and"
            // while still preventing single common words from dominating results.
            minimum_should_match: "75%",
            // Tolerate one-character typos (two for queries longer than five chars).
            fuzziness: "AUTO",
          },
        }
      : null;

    const tagClauses = (tags ?? []).map((tag: string) => ({ term: { tags: tag } }));

    // Tags go in filter context (not must) — they don't affect relevance scoring and
    // OpenSearch caches filter results, making tag-heavy queries faster.
    const esQuery =
      textClause && tagClauses.length > 0
        ? { bool: { must: [textClause], filter: tagClauses } }
        : textClause
          ? textClause
          : { bool: { filter: tagClauses } };

    const start = Date.now();
    const response = await es.search({
      index: "blog_posts",
      body: {
        size: limit,
        query: esQuery,
        _source: ["slug", "title", "summary", "tags", "country", "publishedAt"],
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[search] query="${q ?? ""}" tags=${JSON.stringify(tags ?? [])} took=${Date.now() - start}ms`);
    }

    const results = response.body.hits.hits.map((hit: { _source: object; _score: number }) => ({
      ...(hit._source as object),
      score: hit._score,
    }));

    res.json({
      query: q ?? "",
      filters: { tags: tags ?? [] },
      total: typeof response.body.hits.total === "number"
        ? response.body.hits.total
        : (response.body.hits.total as { value: number } | undefined)?.value ?? 0,
      results,
    });
  } catch (err) {
    console.error("[search] query failed:", {
      query: q,
      tags,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(503).json({ error: "Search is temporarily unavailable" });
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
      body: {
        suggest: {
          post_suggest: {
            prefix: q,
            completion: { field: "suggest", size: 5, skip_duplicates: true },
          },
        },
        _source: false,
      },
    });

    type SuggestOption = { text: string; _score: number };
    const options = (response.body.suggest?.post_suggest?.[0]?.options ?? []) as SuggestOption[];

    const seen = new Set<string>();
    const suggestions = options
      .filter((o) => !seen.has(o.text) && seen.add(o.text))
      .map((o) => ({ text: o.text, score: o._score }));

    res.json({ query: q, suggestions });
  } catch {
    // Suggest failures are non-critical — return empty results rather than an error.
    res.json({ query: q, suggestions: [] });
  }
});

export default router;
