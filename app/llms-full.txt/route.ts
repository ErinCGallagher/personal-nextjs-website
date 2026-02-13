import { getBlogPosts } from "@/app/blog/utils";
import { BASE_URL, LLMS_HEADER } from "@/app/llms-content";

// Serves /llms-full.txt — the full content of every blog post for AI crawlers.
// Each post includes its metadata header followed by the complete MDX body,
// with image components stripped since they are not useful to LLMs.
// See https://llmstxt.org for the convention.

// Image components (ImageGrid2, ImageGrid4, ImageGrid2Mixed, ImageSingle, etc.)
// are JSX blocks that only reference image files — not useful to LLMs.
function stripImageComponents(content: string): string {
  return content.replace(/<Image\w+>[\s\S]*?<\/Image\w+>/g, "").trim();
}

export function GET() {
  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );

  const postSections = posts
    .map((post) => {
      // Build a small metadata header for each post so the LLM has context
      // about the URL, date, and tags before reading the content.
      const meta = [
        `URL: ${BASE_URL}/blog/${post.slug}`,
        `Published: ${post.metadata.publishedAt}`,
        post.metadata.tags?.length ? `Tags: ${post.metadata.tags.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("  \n");

      return `### ${post.metadata.title}\n\n${meta}\n\n${stripImageComponents(post.content)}`;
    })
    .join("\n\n---\n\n");

  const body = `${LLMS_HEADER}

## Blog Posts

${postSections}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
