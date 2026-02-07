This is a [Next.js](https://nextjs.org) project using [MDX](https://mdxjs.com/)

What you'll find:

- A bit about me
- Favourite Apps
- Speaking Engagements & talk resources
- Resume
- Travel blog
- Fun game I made with Unity

## Getting Started

Install dependencies

```bash

npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npm install next react react-dom
npm install @vercel/analytics

```

First, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Next, open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Useful VSCode Extensions

**MDX**

Id: unifiedjs.vscode-mdx

VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx

**Prettier - Code Formater**

Id: esbenp.prettier-vscode

VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

## Deploy on Vercel

[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
Every commit will be built and deployed by vercel. If the commit is outside the main branch, it will still be built by vercel and a status email will be sent once complete

## Custom MDX Blog Components

### VideoLink

Creates a YouTube video preview card with thumbnail, title, and play button. Supports various YouTube URL formats.

```jsx
<VideoLink
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="Video Title (optional)"
/>
```

### MapEmbed

Embeds an interactive map using an iframe.

```jsx
<MapEmbed
  src="/maps/namibia_map.html"
  title="Namibia Road Trip Route"
  height="400px"
/>
```

### ImageSingle

Displays a single image centred with constrained width (max-width: 24rem). Useful for smaller standalone images that shouldn't span full width.

```jsx
<ImageSingle>
  <img
    src="/images/namibia/trip-overview.jpg"
    alt="Trip Overview"
    width={1587}
    height={2245}
  />
</ImageSingle>
```

### ImageGrid2

Displays 2 images side by side with equal width. On mobile, images stack vertically.

```jsx
<ImageGrid2>
  <img
    src="/images/namibia/car-camping.jpg"
    alt="Toyota Helix with car camping setup"
    width={1290}
    height={1668}
  />
  <img
    src="/images/namibia/car-hilix.jpg"
    alt="Toyota Helix"
    width={1148}
    height={1479}
  />
</ImageGrid2>
```

### ImageGrid2Mixed

Displays 2 images with landscape image on left (2/3 width) and portrait image on right (1/3 width, vertically centred). On mobile, images stack vertically.

```jsx
<ImageGrid2Mixed>
  <img
    src="/images/landscape.jpg"
    alt="Landscape photo"
    width={4000}
    height={3000}
  />
  <img
    src="/images/portrait.jpg"
    alt="Portrait photo"
    width={3000}
    height={4000}
  />
</ImageGrid2Mixed>
```

### ImageGrid4

Displays 4 images in an alternating asymmetric layout. On mobile, images stack vertically.

Layout:

- Row 1: Landscape (2/3 width) + Portrait (1/3 width, vertically centred)
- Row 2: Portrait (1/3 width, vertically centred) + Landscape (2/3 width)

```jsx
<ImageGrid4>
  <img
    src="/images/landscape1.jpg"
    alt="Landscape 1"
    width={4000}
    height={3000}
  />
  <img
    src="/images/portrait1.jpg"
    alt="Portrait 1"
    width={3000}
    height={4000}
  />
  <img
    src="/images/portrait2.jpg"
    alt="Portrait 2"
    width={3000}
    height={4000}
  />
  <img
    src="/images/landscape2.jpg"
    alt="Landscape 2"
    width={4000}
    height={3000}
  />
</ImageGrid4>
```
