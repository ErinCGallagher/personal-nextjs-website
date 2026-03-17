/**
 * One-off script to verify Elasticsearch connectivity.
 * Run with: pnpm elastic:test
 */

import "dotenv/config";
import { checkConnection } from "../services/elasticsearch.js";

async function main() {
  const ok = await checkConnection();

  if (ok) {
    console.log("Elasticsearch connection successful.");
    process.exit(0);
  } else {
    console.error("Elasticsearch connection failed.");
    process.exit(1);
  }
}

main();
