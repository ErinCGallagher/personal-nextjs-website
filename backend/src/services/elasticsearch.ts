/**
 * Elasticsearch client for blog post indexing and search.
 * Provides a singleton client instance and health check functionality.
 */

import { Client } from "@opensearch-project/opensearch";

let client: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!client) {
    const url = process.env.ELASTICSEARCH_URL;

    if (!url) {
      throw new Error(
        "ELASTICSEARCH_URL environment variable is required but not set. " +
          "Add it to your .env file (local: http://localhost:9200, Bonsai: https://user:pass@cluster.bonsaisearch.net)."
      );
    }

    // 5-second timeout applied globally so all requests fail fast when OpenSearch is unavailable.
    client = new Client({ node: url, requestTimeout: 5000 });
  }

  return client;
}

/**
 * Verifies connectivity to Elasticsearch by fetching cluster health.
 *
 * @returns Promise that resolves to true if the cluster is reachable, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const es = getElasticsearchClient();
    const health = await es.cluster.health();
    return health.body.status !== undefined;
  } catch (error) {
    console.error("Elasticsearch health check failed:", error);
    return false;
  }
}
