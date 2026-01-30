import { getBlogPosts } from "@/app/blog/utils";
import { FeaturedPost } from "@/app/components/blog/featured-post";
import { SmallPost } from "@/app/components/blog/small-post";

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
          <h1 className="text-4xl font-semibold leading-10 tracking-tight text-foreground">
            Travel Blog
          </h1>
          <p className="mt-2 text-xl text-gray-700">
            Trail guides, campsite reviews, and trip planning for outdoor
            adventures.
          </p>

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
