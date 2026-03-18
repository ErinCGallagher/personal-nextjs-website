/**
 * Health check routes for external service dependencies.
 */

import { Router } from "express";
import { getElasticsearchClient } from "../services/elasticsearch.js";

const router = Router();

// GET /api/health/opensearch
// Returns the current OpenSearch cluster status.
// Cluster status "red" means some primary shards are unassigned (degraded).
// Any connection failure returns 503.
router.get("/opensearch", async (_req, res) => {
  try {
    const es = getElasticsearchClient();
    const { body } = await es.cluster.health();
    const status = body.status === "red" ? "degraded" : "up";
    res.json({ status, cluster: { status: body.status } });
  } catch {
    res.status(503).json({ status: "down" });
  }
});

export default router;
