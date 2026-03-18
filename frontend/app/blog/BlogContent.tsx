/**
 * Client component for the blog listing page. Handles search state and
 * conditionally renders either the post grid or search results.
 */
"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { FeaturedPost } from "@/app/components/blog/post-card/featured-post";
import { SmallPost } from "@/app/components/blog/post-card/small-post";
import { YouTubePromo } from "@/app/components/blog/post-card/youtube-promo";
import { SearchBar } from "@/app/components/blog/SearchBar";
import { SearchResults, SearchResult } from "@/app/components/blog/SearchResults";
import { apiFetch, routes } from "@/app/lib/api";

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

type SearchResponse = {
  query: string;
  total: number;
  results: SearchResult[];
};

type BlogContentProps = {
  featuredPosts: Post[];
  smallPosts: Post[];
};

export function BlogContent({ featuredPosts, smallPosts }: BlogContentProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);

    if (!q) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<SearchResponse>(routes.search.posts(q));
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setError("Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

          <div className="mt-6">
            <SearchBar onSearch={handleSearch} isLoading={loading} />
          </div>

          {query ? (
            <div className="mt-4">
              {!loading && !error && results.length > 0 && (
                <p className="text-sm text-gray-500 mb-2">
                  Found {total} {total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
                </p>
              )}
              <SearchResults
                results={results}
                loading={loading}
                query={query}
                error={error}
              />
            </div>
          ) : (
            <>
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
                        readingTime={post.metadata.readingTime}
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
                        readingTime={post.metadata.readingTime}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
