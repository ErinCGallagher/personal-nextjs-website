/**
 * Renders a list of blog post search results with tags and date.
 */
"use client";

import Link from "next/link";

import { getTagColor, formatDate } from "@/app/blog/post-format";

export type SearchResult = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  publishedAt: string;
  score: number;
};

type SearchResultsProps = {
  results: SearchResult[];
  loading: boolean;
  query: string;
  error?: string | null;
};

export function SearchResults({
  results,
  loading,
  query,
  error,
}: SearchResultsProps) {
  if (loading) {
    return (
      <p className="text-sm text-gray-500 mt-6">Searching…</p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 mt-6">Search failed. Please try again.</p>
    );
  }

  if (!query) {
    return (
      <p className="text-sm text-gray-400 mt-6">Enter a search term to find posts.</p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-6">
        No posts found for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <ul className="mt-6 flex flex-col gap-4">
      {results.map((result) => (
        <li key={result.slug}>
          <Link href={`/blog/${result.slug}`}>
            <article className="group p-5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
                <div className="flex flex-wrap gap-1">
                  {result.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 text-xs rounded text-white"
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <time className="text-sm text-gray-500 whitespace-nowrap shrink-0">
                  {formatDate(result.publishedAt)}
                </time>
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-blue-grey transition-colors line-clamp-2">
                {result.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                {result.summary}
              </p>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
