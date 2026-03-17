# Elasticsearch Setup

Local development uses Docker Compose to run Elasticsearch 8.x and Kibana.
Security is disabled for local dev — never use this config in production.

## Starting and stopping

```bash
# Start Elasticsearch and Kibana (detached)
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

## Data persistence

Elasticsearch data is stored in the `elasticsearch-data` Docker volume.
To wipe all data and start fresh:

```bash
pnpm elastic:down
docker volume rm personal-nextjs-website_elasticsearch-data
pnpm elastic:up
```
