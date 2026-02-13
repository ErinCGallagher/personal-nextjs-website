import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getBlogPost, formatDate, getTagColor } from "../utils";
import { BlogContent } from "@/app/components/blog/blog-content";
import { CustomMDX } from "@/app/components/blog/mdx";
import { TableOfContents } from "@/app/components/blog/table-of-contents";
import { BackToTop } from "@/app/components/blog/back-to-top";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const ogImages = post.metadata.image ? [post.metadata.image] : [];

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
    alternates: {
      canonical: `https://www.egallagher.com/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.metadata.title,
      description: post.metadata.summary,
      images: ogImages,
      publishedTime: post.metadata.publishedAt,
      authors: [post.metadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.summary,
      images: ogImages,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const postUrl = `https://www.egallagher.com/blog/${slug}`;
  const wordCount = post.content
    .replace(/```[\s\S]*?```/g, "") // strip code blocks
    .replace(/[#*_`[\]()>-]/g, "")  // strip markdown syntax characters
    .split(/\s+/)
    .filter(Boolean).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: post.metadata.title,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `https://www.egallagher.com${post.metadata.image}`
      : undefined,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    keywords: post.metadata.tags ?? [],
    wordCount,
    author: {
      "@type": "Person",
      name: post.metadata.author,
    },
    publisher: {
      "@type": "Person",
      name: "Erin Gallagher",
    },
    url: postUrl,
  };

  return (
    <section>
      {/* dangerouslySetInnerHTML is the only way to set inline script content in React.
          It is safe here because the content is derived from your own MDX files, not user input. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {post.metadata.image && (
        <div className="relative w-full h-[500px]">
          <div className="absolute inset-0">
            <Image
              src={post.metadata.image}
              alt={post.metadata.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-6 w-full text-center">
              <h1 className="title font-semibold text-5xl tracking-tighter text-white">
                {post.metadata.title}
              </h1>
            </div>
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto lg:flex gap-8 items-start">
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-8 self-start pt-12">
            <TableOfContents source={post.content} />
          </aside>
          <main className="flex-1 min-w-0 max-w-4xl mx-auto px-8 md:px-16 py-12 bg-white text-foreground rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={post.metadata.authorImage || "/default-author.jpg"}
                  alt={post.metadata.author || "Erin Gallagher"}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-neutral-900">
                  Written by{" "}
                  <span className="font-medium">{post.metadata.author}</span>
                </p>
                <p className="text-sm text-neutral-600">
                  Published on {formatDate(post.metadata.publishedAt)}
                </p>
              </div>
            </div>
            {post.metadata.tags && post.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-12">
                {post.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 text-sm rounded text-white"
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="lg:hidden mb-6">
              <TableOfContents source={post.content} variant="collapsible" />
            </div>
            <BlogContent>
              <article className="prose max-w-none">
                <CustomMDX source={post.content} />
              </article>
            </BlogContent>
          </main>
        </div>
      </div>
      <BackToTop />
    </section>
  );
}
