# Search Setup

Local development uses Docker Compose to run OpenSearch 2.x and OpenSearch Dashboards.
Security is disabled for local dev — never use this config in production.

## Starting and stopping

```bash
# Start Elasticsearch and Kibana (detached) (root repo)
pnpm elastic:up

# Stop containers
pnpm elastic:down

# Tail container logs
pnpm elastic:logs
```

OpenSearch starts on `http://localhost:9200`.
OpenSearch Dashboards starts on `http://localhost:5601` (may take 30–60 seconds after OpenSearch is ready).

## Health check

```bash
curl http://localhost:9200/_cluster/health?pretty
```

Expected response:

```json
{
  "cluster_name" : "docker-cluster",
  "status" : "green",
  ...
}
```

## OpenSearch Dashboards Dev Tools

1. Open `http://localhost:5601`
2. Navigate to **Management → Dev Tools**
3. Use the console to run OpenSearch queries directly, e.g.:

```
GET _cluster/health
GET _cat/indices?v
```

## Environment variables

| Variable            | Description                      | Default                    |
| ------------------- | -------------------------------- | -------------------------- |
| `ELASTICSEARCH_URL` | Elasticsearch connection URL     | `http://localhost:9200`    |

Copy `.env.example` to create your local `.env` file.

## Relevance tuning

The search query uses `multi_match` with three strategies layered together:

**Field boosting** — title matches outweigh summary matches, which outweigh content and country matches. This reflects how readers think: a post titled "Yellowstone" is far more relevant to a "yellowstone" query than one that mentions the word once in the body.

| Field     | Boost |
| --------- | ----- |
| `title`   | ×3    |
| `summary` | ×2    |
| `content` | ×1    |
| `country` | ×1    |

**`minimum_should_match: "75%"`** — most query terms must be present, but not necessarily all. A two-word query requires both terms; a four-word query can miss one. This prevents a common word like "south" in "south africa" from matching unrelated posts, while still returning results when the user types a slightly longer phrase.

**`fuzziness: "AUTO"`** — Elasticsearch auto-selects edit distance based on term length: exact for 1–2 characters, one edit for 3–5 characters, two edits for six or more. This handles common typos ("hikking" → "hiking") without over-matching on short words.

**English analyser** — applied to `title`, `summary`, and `content` at index time and query time. It strips stopwords ("the", "a", "in") and stems terms ("hiking" → "hike", "running" → "run"), so queries and documents match on root forms regardless of inflection.

## Reindexing

To rebuild the `blog_posts` index from scratch (e.g. after changing the mapping or adding new posts):

```bash
pnpm elastic:reindex --force
```

This deletes the existing index, recreates it with the current mapping, then indexes all MDX posts. The `--force` flag is required to confirm the deletion.

## Production setup (Bonsai)

Production uses [Bonsai](https://bonsai.io) managed OpenSearch (hobby free tier).

### Client

The backend uses `@opensearch-project/opensearch` rather than `@elastic/elasticsearch`.
Bonsai's hobby tier runs OpenSearch, which rejects the Elasticsearch v8 client.

### Environment variable

Set `ELASTICSEARCH_URL` in Railway to your Bonsai cluster URL:

```
https://user:password@my-cluster.bonsaisearch.net
```

The URL is available on the **Credentials** tab of your cluster in the Bonsai dashboard.

### Reindexing production

Run the reindex script with your Bonsai URL set locally:

```bash
ELASTICSEARCH_URL=https://user:password@my-cluster.bonsaisearch.net \
  pnpm elastic:reindex --force
```

Or temporarily update your local `.env`, run the script, then restore it.

### Verifying the index

Bonsai has no Kibana. Use curl instead:

```bash
# Document count
curl https://user:password@my-cluster.bonsaisearch.net/blog_posts/_count

# Sample documents
curl https://user:password@my-cluster.bonsaisearch.net/blog_posts/_search?size=3
```

## Data persistence

Elasticsearch data is stored in the `elasticsearch-data` Docker volume.
To wipe all data and start fresh:

```bash
pnpm elastic:down
docker volume rm personal-nextjs-website_opensearch-data
pnpm elastic:up
```
