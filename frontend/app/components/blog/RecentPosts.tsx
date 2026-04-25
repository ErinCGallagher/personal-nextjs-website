"use client";

import { useState } from "react";
import { SmallPost } from "@/app/components/blog/post-card/small-post";

type Post = {
  slug: string;
  metadata: {
    title: string;
    summary: string;
    publishedAt: string;
    image?: string;
    tags?: string[];
    readingTime?: number;
  };
};

const POSTS_PER_PAGE = 9;

export function RecentPosts({ posts }: { posts: Post[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl !font-bold !tracking-normal text-foreground mb-6">
        Recent
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paginatedPosts.map((post) => (
          <SmallPost
            key={post.slug}
            slug={post.slug}
            title={post.metadata.title}
            summary={post.metadata.summary}
            publishedAt={post.metadata.publishedAt}
            image={post.metadata.image}
            tags={post.metadata.tags}
            readingTime={post.metadata.readingTime}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-[#8586A9] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
