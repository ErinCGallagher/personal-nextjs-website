import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getBlogPost, formatDate, getTagColor } from "../utils";
import { BlogContent } from "@/app/components/blog/blog-content";
import { CustomMDX } from "@/app/components/blog/mdx";

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

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
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
        <main className="max-w-4xl mx-auto px-8 md:px-16 py-12 bg-white text-foreground rounded-lg">
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
          <BlogContent>
            <article className="prose max-w-none">
              <CustomMDX source={post.content} />
            </article>
          </BlogContent>
        </main>
      </div>
    </section>
  );
}
