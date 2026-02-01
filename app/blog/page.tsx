import Image from "next/image";
import { getBlogPosts } from "@/app/blog/utils";
import { FeaturedPost } from "@/app/components/blog/featured-post";
import { SmallPost } from "@/app/components/blog/small-post";
import { YouTubePromo } from "@/app/components/blog/youtube-promo";

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
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 bg-white text-foreground rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-center">
            <Image
              src="/icons/trail-tales-logo.png"
              alt="Trail Tales Travel"
              width={180}
              height={180}
              className="rounded-lg"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-semibold leading-10 tracking-tight text-foreground">
                Trail Tales Travel Blog
              </h1>
              <p className="mt-3 text-xl text-gray-700">
                Exploring the world one trail at a time. We share detailed trail
                guides, honest campsite reviews, and practical itineraries from
                our global adventures. From backcountry routes to epic road
                trips, we help you plan unforgettable outdoor experiences. Find
                our video guides on{" "}
                <a
                  href="https://www.youtube.com/@trailtalestravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8586A9] hover:underline"
                >
                  YouTube
                </a>
                .
              </p>
            </div>
          </div>

          {featuredPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl !font-bold !tracking-normal text-foreground mb-6">
                Featured
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <FeaturedPost
                    key={post.slug}
                    slug={post.slug}
                    title={post.metadata.title}
                    summary={post.metadata.summary}
                    publishedAt={post.metadata.publishedAt}
                    image={post.metadata.image}
                    tags={post.metadata.tags}
                  />
                ))}
              </div>
            </div>
          )}

          <YouTubePromo />

          {smallPosts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl !font-bold !tracking-normal text-foreground mb-6">
                Recent
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {smallPosts.map((post) => (
                  <SmallPost
                    key={post.slug}
                    slug={post.slug}
                    title={post.metadata.title}
                    summary={post.metadata.summary}
                    publishedAt={post.metadata.publishedAt}
                    image={post.metadata.image}
                    tags={post.metadata.tags}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
