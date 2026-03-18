import fs from "fs";
import path from "path";
export { getTagColor, formatDate } from "@/app/blog/post-format";

type Metadata = {
  title: string;
  publishedAt: string;
  author: string;
  authorImage?: string;
  summary: string;
  image?: string;
  tags?: string[];
  featured?: string;
  readingTime?: number;
};

/**
 * Returns all published blog posts from the posts directory.
 * This does NOT include drafts - only posts in app/blog/posts.
 * Used for blog listing pages and recent posts components.
 */
export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), "app", "blog", "posts"));
}

/**
 * Returns a single blog post by slug.
 * Checks published posts first, then drafts (in development only).
 * Used for individual blog post pages where you want to view drafts via direct URL.
 *
 * @param slug - The post filename without extension (e.g., "my-post" for "my-post.mdx")
 * @returns Post object with metadata, content, and isDraft flag, or null if not found
 */
export function getBlogPost(slug: string) {
  const postsDir = path.join(process.cwd(), "app", "blog", "posts");

  // Try to find in published posts first
  const publishedPath = path.join(postsDir, `${slug}.mdx`);
  if (fs.existsSync(publishedPath)) {
    const { metadata, content } = readMDXFile(publishedPath);
    return { metadata, slug, content, isDraft: false };
  }

  // In development, also check drafts folder
  if (process.env.NODE_ENV === "development") {
    const draftsDir = path.join(postsDir, "drafts");
    const draftPath = path.join(draftsDir, `${slug}.mdx`);
    if (fs.existsSync(draftPath)) {
      const { metadata, content } = readMDXFile(draftPath);
      return { metadata, slug, content, isDraft: true };
    }
  }

  return null;
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: fs.PathOrFileDescriptor) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, "").trim();
  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes

    const trimmedKey = key.trim();
    if (trimmedKey === "tags") {
      metadata.tags = value.split(",").map((tag) => tag.trim());
    } else if (
      trimmedKey === "title" ||
      trimmedKey === "publishedAt" ||
      trimmedKey === "author" ||
      trimmedKey === "authorImage" ||
      trimmedKey === "summary" ||
      trimmedKey === "image" ||
      trimmedKey === "featured"
    ) {
      metadata[trimmedKey] = value;
    } else if (trimmedKey === "readingTime") {
      metadata.readingTime = parseInt(value, 10);
    }
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}
