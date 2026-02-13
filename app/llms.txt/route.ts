import { getBlogPosts } from "@/app/blog/utils";
import { BASE_URL, LLMS_HEADER } from "@/app/llms-content";

// Serves /llms.txt — a summary index of the site for AI crawlers.
// Each blog post is a single line with title, URL, and summary.
// See https://llmstxt.org for the convention.
export function GET() {
  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );

  const postLines = posts
    .map((post) => `- [${post.metadata.title}](${BASE_URL}/blog/${post.slug}): ${post.metadata.summary}`)
    .join("\n");

  const body = `${LLMS_HEADER}

## Blog Posts

${postLines}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
