# egallagher.com

Personal website and travel blog. Built as a pnpm monorepo with a Next.js frontend and an Express backend.

## What's on the site

- About me, resume, speaking engagements
- Travel blog with MDX posts
- A Unity game

## Tech stack

| | |
|---|---|
| Frontend | Next.js, Tailwind CSS, MDX, Better_auth |
| Backend | Express, PostgreSQL, OpenSearch (via Bonsai) |
| Package manager | pnpm (monorepo) |
| Hosting | Vercel (frontend), Railway (backend) |

## Getting started

Install all dependencies from the root:

```bash
pnpm install
```

Run the frontend:

```bash
cd frontend
pnpm dev
```

Run the backend:

```bash
cd backend
pnpm dev
```

### OpenSearch (blog search)

Blog search requires a local OpenSearch instance. Start it with Docker:
([Download Docker](https://www.docker.com/products/docker-desktop/) if you don't have it)

```bash
docker compose up -d
```

This starts OpenSearch on port 9200 and OpenSearch Dashboards on port 5601.

On first run (or after wiping the index), create the index and populate it from the backend:

```bash
cd backend
pnpm elastic:create-posts-index
pnpm elastic:index-posts
```

To reindex after post changes:

```bash
cd backend
pnpm elastic:reindex
```

## More Details

See [`frontend/README.md`](./frontend/README.md), [`backend/README.md`](./backend/README.md), and [`docs/elasticsearch-setup.md`](./docs/elasticsearch-setup.md) for setup details.

## Recommended VS Code extensions

| Extension | ID |
|---|---|
| MDX | `unifiedjs.vscode-mdx` |
| Prettier | `esbenp.prettier-vscode` |
| Vitest | `vitest.explorer` |
| Code Spell Checker | `streetsidesoftware.code-spell-checker` |
