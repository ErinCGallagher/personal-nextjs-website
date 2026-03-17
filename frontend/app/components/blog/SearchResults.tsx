/**
 * Renders a list of blog post search results with tags, date, and relevance score.
 */
"use client";

import Link from "next/link";

// These pure helpers are duplicated here to avoid importing from @/app/blog/utils,
// which pulls in Node.js `fs` and cannot be bundled for the browser.
function getTagColor(tag: string) {
  const t = tag.toLowerCase();
  if (t === "camping") return "#8b7dd8";
  if (t === "food") return "#e685a0";
  if (t === "hiking") return "#6ba3f5";
  if (t === "safari") return "#7bc99d";
  return "#7b9ae0";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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
                <div className="flex items-center gap-2 shrink-0">
                  <time className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(result.publishedAt)}
                  </time>
                  <span className="text-xs text-gray-400">
                    score: {result.score.toFixed(2)}
                  </span>
                </div>
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
