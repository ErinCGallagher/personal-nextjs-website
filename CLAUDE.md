# CLAUDE.md

## Project

Personal website and travel blog. Features a home page, conference talks page, and a Unity game. The blog supports articles with comments and likes, an admin moderation panel, and AI-assisted comment moderation.

### Stack

Frontend:

- Next.js
- TypeScript
- Tailwind
- mdx
- Vercel hosting

Backend:

- Express.js
- PostgreSQL
- BetterAuth (session management)
- Resend for email management
- Railway hosting

### Structure

Monorepo with `frontend/` and `backend/` packages managed by pnpm workspaces.

frontend/
  app/blog/posts/                 # Live MDX posts
  app/blog/posts/drafts/          # Draft posts (not rendered)
  app/blog/[slug]/                # Dynamic post page
  app/admin/comments/             # Comment moderation panel
  app/components/                 # General reusable UI components
  app/components/blog/engagement/ # Likes + comments UI
  app/lib/                        # Shared utilities
  app/llms.txt                    # AI discoverability endpoint
  mdx/types/                      # MDX type definitions

backend/
  src/routes/        # Express route handlers
  src/middleware/    # Express middleware
  src/types/         # Shared TypeScript types

### Commands

backend commands:

- pnpm dev   # Start server
- pnpm test

frontend commands:

- pnpm dev  # Start server

### Available tools:

- ffmpeg
- psql
- railway
- vercel

### Decisions & learnings:

<!-- Append dated bullets when something bites us. Prevents recurring mistakes. -->

**2026-03-09: BetterAuth configuration with separate frontend/backend**

- `BETTER_AUTH_URL` must be set to the **frontend domain** (`https://www.egallagher.com`), not the backend domain
- Why: BetterAuth uses this URL to set session cookies; cookies must be on the frontend domain to work with Next.js rewrites
- Frontend client components must use relative paths (`/api/admin/comments`) not direct backend URLs (`${NEXT_PUBLIC_API_URL}/api/admin/comments`)
- Why: Direct backend requests bypass the Next.js proxy, causing cross-domain cookie issues with `SameSite: lax`
- `CORS_ORIGIN` supports comma-separated multiple domains: `https://www.egallagher.com,https://egallagher.com`
- Cookie names vary by environment: `better-auth.session_token` (dev) vs `__Secure-better-auth.session_token` (production)

---

## Working together

We're coworkers. I am Erin. Push back when you think you're right, but cite evidence. Ask rather than assume. Say "I don't know" when you don't.

## Code

- Simplicity and readability over cleverness
- Smallest reasonable change to reach the goal; never rewrite from scratch without permission
- Match surrounding style; consistency within a file beats external standards
- Reduce duplication; preserve comments unless actively false
- Comments explain _why_, not _what_; no temporal references ("recently refactored...")
- Evergreen names only — never "new", "improved", "enhanced"
- Every new file gets a `/** */` comment describing its purpose
- No unrelated changes — file issues instead

## Tests

- Write tests before implementation (TDD)
- Never mock what you're testing; never write tests that only test mocks
- Test output must be pristine; assert expected errors, don't ignore them
- Unit tests on all projects; integration/e2e only if a framework already exists

## Debugging

Find the root cause — never patch a symptom. One hypothesis at a time; smallest possible change to test it. If the fix doesn't work, stop and re-analyse before trying anything else.

## Style

- Canadian spelling in docs/commits; American in code
- Never use "robust" or "thorough"

## Git

- Never `--no-verify`; fix hooks or ask for help
- Semantic commits (`fix:`, `feat:`, `chore:`), first line ≤ 80 chars
- Never add AI as coauthor; create a WIP branch if none exists
- Double quotes `"` not single `'`

## Planning

- Never create `todo.md` files — use the TodoWrite tool for progress tracking instead
- Store plan documents in `.claude/claude-plan/` with descriptive names (e.g., `auth-plan.md`, not `plan.md`)
- Plans should include implementation steps, prompts for LLMs, and context for future reference
