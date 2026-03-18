# Elasticsearch Setup

Local development uses Docker Compose to run Elasticsearch 8.x and Kibana.
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

Elasticsearch starts on `http://localhost:9200`.
Kibana starts on `http://localhost:5601` (may take 30–60 seconds after Elasticsearch is ready).

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

## Kibana Dev Tools

1. Open `http://localhost:5601`
2. Navigate to **Management → Dev Tools**
3. Use the console to run Elasticsearch queries directly, e.g.:

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

## Data persistence

Elasticsearch data is stored in the `elasticsearch-data` Docker volume.
To wipe all data and start fresh:

```bash
pnpm elastic:down
docker volume rm personal-nextjs-website_elasticsearch-data
pnpm elastic:up
```
