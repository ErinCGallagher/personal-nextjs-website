/**
 * Blog post search page. Reads/writes the `q` URL query param and fetches
 * results from the backend search API.
 */
"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/app/components/blog/SearchBar";
import { SearchResults, SearchResult } from "@/app/components/blog/SearchResults";
import { apiFetch, routes } from "@/app/lib/api";

type SearchResponse = {
  query: string;
  total: number;
  results: SearchResult[];
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (q: string) => {
    setQuery(q);

    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });

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
  }, [router, searchParams]);

  // Run search on initial load if query param is present
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-2xl mx-auto">
      <h1 className="font-playfair-display text-3xl font-bold text-foreground mb-6">
        Search
      </h1>
      <SearchBar
        onSearch={runSearch}
        initialValue={initialQuery}
        isLoading={loading}
      />
      {query && !loading && !error && results.length > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Found {total} {total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
        </p>
      )}
      <SearchResults
        results={results}
        loading={loading}
        query={query}
        error={error}
      />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
