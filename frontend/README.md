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

### ImageSingle

Single image centred with constrained width (max 24rem).

```jsx
<ImageSingle>
  <img src="/images/photo.jpg" alt="Description" width={1587} height={2245} />
</ImageSingle>
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
