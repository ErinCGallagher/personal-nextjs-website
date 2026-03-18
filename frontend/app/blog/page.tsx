import { Metadata } from "next";
import { getBlogPosts } from "@/app/blog/utils";
import { BlogContent } from "@/app/blog/BlogContent";

export const metadata: Metadata = {
  title: "Trail Tales Travel Blog",
  description:
    "Detailed trail guides, honest campsite reviews, and practical itineraries from our global adventures. From backcountry routes to epic road trips.",
  openGraph: {
    type: "website",
    title: "Trail Tales Travel Blog",
    description:
      "Detailed trail guides, honest campsite reviews, and practical itineraries from our global adventures. From backcountry routes to epic road trips.",
    images: ["/icons/trail-tales-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trail Tales Travel Blog",
    description:
      "Detailed trail guides, honest campsite reviews, and practical itineraries from our global adventures. From backcountry routes to epic road trips.",
    images: ["/icons/trail-tales-logo.png"],
  },
};

export default function Page() {
  const allPosts = getBlogPosts();

  const sortedPosts = allPosts.sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt).getTime();
    const dateB = new Date(b.metadata.publishedAt).getTime();
    return dateB - dateA;
  });

  const allFeatured = sortedPosts.filter(
    (post) => post.metadata.featured?.toLowerCase() === "yes",
  );

  const allSmall = sortedPosts.filter(
    (post) => !(post.metadata.featured?.toLowerCase() === "yes"),
  );

  const featuredPosts = allFeatured.slice(0, 2);
  const extraFeatured = allFeatured.slice(2);
  const smallPosts = [...extraFeatured, ...allSmall];

  return (
    <BlogContent featuredPosts={featuredPosts} smallPosts={smallPosts} />
  );
}
