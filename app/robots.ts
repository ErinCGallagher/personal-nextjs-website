import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/game", "/drafts"],
    },
    sitemap: "https://egallagher.com/sitemap.xml",
  };
}
