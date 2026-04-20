# Project Instructions

## Commands

```bash
# Dev
pnpm dev              # start frontend dev server
pnpm dev:backend      # start backend dev server

# Build
pnpm build            # build frontend

# Test
pnpm --filter frontend test            # run frontend tests
pnpm --filter backend test             # run backend tests
pnpm --filter frontend test -- path/to/file  # run single test

# Lint
pnpm lint             # lint all packages

# Type check
pnpm --filter frontend exec tsc --noEmit
pnpm --filter backend exec tsc --noEmit

# DB migrations
pnpm --filter backend migrate
```

## Architecture

Monorepo with pnpm workspaces:

- `frontend/` — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, MDX blog posts
- `backend/` — Express.js API, TypeScript, tsx runner
  - `backend/src/routes/` — route handlers
  - `backend/src/middleware/` — request middleware
  - `backend/src/services/` — business logic
  - `backend/src/db/` — DB query functions
  - `backend/migrations/` — raw SQL migrations (numbered prefix)

## Workflow

- Run typecheck after making a series of code changes
- Prefer fixing the root cause over adding workarounds
- When unsure about approach, use plan mode (`Shift+Tab`) before coding

## Don'ts

- Don't modify generated files (`*.gen.ts`, `*.generated.*`)

## Tests

- Write tests before implementation (TDD)
- Never mock what you're testing; never write tests that only test mocks
- Test output must be pristine; assert expected errors, don't ignore them

## Style

- Canadian spelling in docs/commits; American in code

## Planning

- Never create `todo.md` files — use the TodoWrite tool for progress tracking instead
- Store plan documents in `.claude/claude-plan/` with descriptive names (e.g., `auth-plan.md`, not `plan.md`)
- Plans should include implementation steps, prompts for LLMs, and context for future reference
