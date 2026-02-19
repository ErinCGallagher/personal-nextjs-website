# egallagher.com

Personal website and travel blog. Built as a pnpm monorepo with a Next.js frontend and an Express backend.

## What's on the site

- About me, resume, speaking engagements
- Travel blog with MDX posts
- A Unity game

## Tech stack

| | |
|---|---|
| Frontend | Next.js, Tailwind CSS, MDX |
| Backend | Express, PostgreSQL |
| Package manager | pnpm (monorepo) |
| Hosting | Vercel (frontend), TBD (backend) |

## Getting started

Install all dependencies from the root:

```bash
pnpm install
```

Run the frontend:

```bash
pnpm dev
```

Run the backend:

```bash
pnpm dev:backend
```

See [`frontend/README.md`](./frontend/README.md) and [`backend/README.md`](./backend/README.md) for setup details.

## Recommended VS Code extensions

| Extension | ID |
|---|---|
| MDX | `unifiedjs.vscode-mdx` |
| Prettier | `esbenp.prettier-vscode` |
| Vitest | `vitest.explorer` |
| Code Spell Checker | `streetsidesoftware.code-spell-checker` |
