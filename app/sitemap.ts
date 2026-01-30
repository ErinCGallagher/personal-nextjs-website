import { MetadataRoute } from "next";
import { getBlogPosts } from "@/app/blog/utils";

const BASE_URL = "https://egallagher.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getBlogPosts();

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.metadata.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/talks`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...blogEntries,
  ];
}
