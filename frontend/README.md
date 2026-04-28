# Frontend

Next.js app for egallagher.com. Blog posts are written in MDX and rendered at build time.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The page auto-updates as you edit files in `app/`.

## Build & deploy

Every commit to `main` is built and deployed automatically by Vercel. Commits on other branches are built and a status email is sent.

To build locally:

```bash
pnpm build
```

## Environment variables

Create a `.env.local` file in `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Authentication

Authentication is handled by [BetterAuth](https://www.better-auth.com/), with the session managed by the backend. The admin panel at `/admin` requires an authenticated session with the `admin` role.

### How it works

All `/api/*` requests are proxied to the backend via a Next.js rewrite in `next.config.mjs`. This means auth requests stay on the same domain, so session cookies are set correctly without cross-domain issues.

**Client components** use `authClient` from `app/lib/auth-client.ts`:

```ts
import { authClient } from "@/lib/auth-client";

const { data: session } = authClient.useSession();
await authClient.signIn.email({ email, password });
await authClient.signOut();
```

**Server components** use `app/lib/auth-server.ts` to check sessions server-side. Because Next.js rewrites don't apply to server-side fetches, these go directly to the backend URL with forwarded cookies:

```ts
import { requireAdmin } from "@/lib/auth-server";

const { authorized, session } = await requireAdmin();
if (!authorized) redirect("/admin");
```

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL used for server-side auth requests (e.g. `http://localhost:3001`) |

### Important constraints

- Client components **must** use relative paths (e.g. `/api/admin/comments`), not direct backend URLs. Direct backend requests bypass the Next.js proxy and break cookie handling.
- The backend's `BETTER_AUTH_URL` must be set to the **frontend domain**, not the backend domain, so session cookies are set on the right domain.

## MDX blog components

Custom components available inside `.mdx` post files.

### VideoLink

YouTube video preview card with thumbnail and play button.

```jsx
<VideoLink url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Video Title (optional)" />
```

### MapEmbed

Interactive map via iframe.

```jsx
<MapEmbed src="/maps/namibia_map.html" title="Namibia Road Trip Route" height="400px" />
```

### ImageSingleVertical

Single portrait image centred with constrained width (max 24rem).

```jsx
<ImageSingleVertical>
  <img src="/images/photo.jpg" alt="Description" width={1587} height={2245} />
</ImageSingleVertical>
```

### ImageSingleHorizontal

Single landscape image centred with wider constrained width (max 42rem).

```jsx
<ImageSingleHorizontal>
  <img src="/images/photo.jpg" alt="Description" width={2245} height={1587} />
</ImageSingleHorizontal>
```

### ImageGrid2

Two images side by side. Stacks vertically on mobile.

```jsx
<ImageGrid2>
  <img src="/images/a.jpg" alt="..." width={1290} height={1668} />
  <img src="/images/b.jpg" alt="..." width={1148} height={1479} />
</ImageGrid2>
```

### ImageGrid2Mixed

Landscape (2/3) left, portrait (1/3) right. Stacks vertically on mobile.

```jsx
<ImageGrid2Mixed>
  <img src="/images/landscape.jpg" alt="..." width={4000} height={3000} />
  <img src="/images/portrait.jpg" alt="..." width={3000} height={4000} />
</ImageGrid2Mixed>
```

### ImageGrid4

Four images in an alternating asymmetric layout. Stacks vertically on mobile.

Row 1: landscape (2/3) + portrait (1/3)
Row 2: portrait (1/3) + landscape (2/3)

```jsx
<ImageGrid4>
  <img src="/images/landscape1.jpg" alt="..." width={4000} height={3000} />
  <img src="/images/portrait1.jpg" alt="..." width={3000} height={4000} />
  <img src="/images/portrait2.jpg" alt="..." width={3000} height={4000} />
  <img src="/images/landscape2.jpg" alt="..." width={4000} height={3000} />
</ImageGrid4>
```

## Recommended VS Code extensions

- **MDX** — `unifiedjs.vscode-mdx`
- **Prettier** — `esbenp.prettier-vscode`
