# Backend

Express API server for egallagher.com.

## Prerequisites

PostgreSQL 17.x is managed via [mise](https://mise.jdx.dev). From the project root:

```bash
mise install
```

Initialise the data directory on first setup:

```bash
initdb --locale=en_US.UTF-8 -E UTF-8
```

Start and stop the database:

```bash
pg_ctl start -l .postgres/postgres.log
pg_ctl stop
```

Create the databases on first setup:

```bash
createdb blog_dev
createdb blog_test
```

Run migrations:

```bash
pnpm migrate
```

## Development

```bash
pnpm dev
```

Server runs on port 3001 by default.

## Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Endpoints

### Posts

```bash
# Get like count for a post
curl http://localhost:3001/api/posts/cape-town-itinerary/likes

# Like/unlike a post (anonymous_id comes from localStorage on the client)
curl -X POST http://localhost:3001/api/posts/cape-town-itinerary/like \
  -H "Content-Type: application/json" \
  -d '{"anonymous_id": "your-uuid-here"}'
```

### Health

```bash
curl http://localhost:3001/health
```
