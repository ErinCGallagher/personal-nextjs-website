# Backend

Express API server for egallagher.com.

## Prerequisites

PostgreSQL 17 is managed via [mise](https://mise.jdx.dev). Run once from the project root:

```bash
mise install
initdb --locale=en_US.UTF-8 -E UTF-8
createdb blog_dev
createdb blog_test
pnpm migrate
```

Start and stop the database:

```bash
pg_ctl start -l .postgres/postgres.log
pg_ctl stop
```

## Environment variables

Create a `.env` file in `backend/`:

```
DATABASE_URL=postgresql://localhost/blog_dev
CORS_ORIGIN=http://localhost:3000
```

## Development

```bash
pnpm dev
```

Server runs on [http://localhost:3001](http://localhost:3001) by default.

## Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

The [Vitest VS Code extension](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) is recommended for running and debugging individual tests from the editor.

## Endpoints

### Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check and database connection test |

### Post Interactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts/:slug/likes?anonymous_id=` | Like count, comment count, and liked state for a post |
| POST | `/api/posts/:slug/like` | Toggle a like on a post |
| GET | `/api/posts/:slug/comments` | Get all approved comments for a post |
| POST | `/api/posts/:slug/comment` | Create a comment on a post (sends email notification) |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Authenticate admin with password |
| POST | `/api/admin/logout` | Destroy admin session |
| GET | `/api/admin/comments?status=Pending` | List comments filtered by status (Pending/Approved/Rejected) |
| PATCH | `/api/admin/comments/:id` | Update comment status |

### Examples

```bash
# Get like count and comment count
curl http://localhost:3001/api/posts/cape-town-itinerary/likes?anonymous_id=550e8400-e29b-41d4-a716-446655440001

# Toggle a like
curl -X POST http://localhost:3001/api/posts/cape-town-itinerary/like \
  -H "Content-Type: application/json" \
  -d '{"anonymous_id": "550e8400-e29b-41d4-a716-446655440001"}'

# Get approved comments
curl http://localhost:3001/api/posts/cape-town-itinerary/comments

# Create a comment
curl -X POST http://localhost:3001/api/posts/cape-town-itinerary/comment \
  -H "Content-Type: application/json" \
  -d '{"anonymous_id": "550e8400-e29b-41d4-a716-446655440001", "name": "Jane Doe", "email": "jane@example.com", "body": "Great post!"}'

# Admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "your-password"}' \
  -c cookies.txt

# List pending comments
curl http://localhost:3001/api/admin/comments?status=Pending \
  -b cookies.txt

# Approve a comment
curl -X PATCH http://localhost:3001/api/admin/comments/COMMENT-UUID \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}' \
  -b cookies.txt
```
