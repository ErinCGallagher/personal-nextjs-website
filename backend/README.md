# Backend

Express API server for egallagher.com.

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

# Like/unlike a post
curl -X POST http://localhost:3001/api/posts/cape-town-itinerary/like
```

### Health

```bash
curl http://localhost:3001/health
```
