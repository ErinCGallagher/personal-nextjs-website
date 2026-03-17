/**
 * Script to read MDX blog posts from the frontend and index them into Elasticsearch.
 * Run with: pnpm elastic:index-posts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getElasticsearchClient } from "../services/elasticsearch.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INDEX_NAME = "blog_posts";
const POSTS_DIR = path.resolve(
  __dirname,
  "../../../frontend/app/blog/posts"
);

interface PostDocument {
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  featured: boolean;
  readingTime: number;
  image: string;
  country?: string[];
}

function parseFrontmatter(fileContent: string): {
  metadata: Record<string, string | string[] | number | boolean>;
  content: string;
} {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    return { metadata: {}, content: fileContent.trim() };
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const metadata: Record<string, string | string[] | number | boolean> = {};

  frontMatterBlock
    .trim()
    .split("\n")
    .forEach((line) => {
      const [key, ...valueArr] = line.split(": ");
      let value = valueArr.join(": ").trim();
      value = value.replace(/^['"](.*)['"]$/, "$1");

      const trimmedKey = key.trim();
      if (trimmedKey === "tags" || trimmedKey === "country") {
        metadata[trimmedKey] = value.split(",").map((v) => v.trim());
      } else if (trimmedKey === "readingTime") {
        metadata.readingTime = parseInt(value, 10);
      } else if (trimmedKey === "featured") {
        metadata.featured = value === "yes";
      } else if (trimmedKey) {
        metadata[trimmedKey] = value;
      }
    });

  return { metadata, content };
}

/** Strips MDX/JSX components and markdown syntax to produce indexable plain text. */
function stripMdx(content: string): string {
  return content
    .replace(/^import .+$/gm, "")           // remove import statements
    .replace(/<[A-Z][^>]*\/>/g, "")         // remove self-closing JSX components
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "") // remove JSX blocks
    .replace(/^#{1,6}\s+/gm, "")            // remove heading markers
    .replace(/\*\*(.+?)\*\*/g, "$1")        // unwrap bold
    .replace(/\*(.+?)\*/g, "$1")            // unwrap italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // unwrap links
    .replace(/`{1,3}[^`]*`{1,3}/g, "")     // remove inline code and code blocks
    .replace(/^\s*[-*>]\s+/gm, "")          // remove list markers and blockquotes
    .replace(/\n{3,}/g, "\n\n")             // collapse excess blank lines
    .trim();
}

async function main() {
  const es = getElasticsearchClient();

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") && f !== "drafts");

  console.log(`Found ${files.length} posts to index.`);

  const documents: PostDocument[] = files.map((file) => {
    const slug = path.basename(file, ".mdx");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { metadata, content } = parseFrontmatter(raw);

    return {
      slug,
      title: (metadata.title as string) ?? "",
      summary: (metadata.summary as string) ?? "",
      content: stripMdx(content),
      author: (metadata.author as string) ?? "",
      publishedAt: (metadata.publishedAt as string) ?? "",
      tags: (metadata.tags as string[]) ?? [],
      featured: (metadata.featured as boolean) ?? false,
      readingTime: (metadata.readingTime as number) ?? 0,
      image: (metadata.image as string) ?? "",
      ...(metadata.country ? { country: metadata.country as string[] } : {}),
    };
  });

  // Bulk index in batches of 100
  const BATCH_SIZE = 100;
  let indexed = 0;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);

    const operations = batch.flatMap((doc) => [
      { index: { _index: INDEX_NAME, _id: doc.slug } },
      doc,
    ]);

    const result = await es.bulk({ operations });

    if (result.errors) {
      const failed = result.items.filter((item) => item.index?.error);
      failed.forEach((item) =>
        console.error(`Failed to index ${item.index?._id}:`, item.index?.error)
      );
    }

    indexed += batch.length;
    console.log(`Indexed ${indexed}/${documents.length} posts`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Indexing failed:", err);
  process.exit(1);
});
