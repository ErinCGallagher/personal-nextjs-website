/**
 * Displays tag pills fetched from the API that can be toggled as search filters.
 * Selection state is managed by the parent; this component emits toggle events.
 */
"use client";

import { useState, useEffect } from "react";
import { apiFetch, routes } from "@/app/lib/api";
import { getTagColor } from "@/app/blog/post-format";

type Tag = { name: string; count: number };

const FALLBACK_TAGS: Tag[] = [
  { name: "Hiking", count: 7 },
  { name: "Camping", count: 5 },
  { name: "Itinerary", count: 5 },
  { name: "Safari", count: 3 },
  { name: "Food", count: 1 },
  { name: "City Guide", count: 1 },
  { name: "Travel Tips", count: 1 },
];

type TagFilterListProps = {
  selectedTags: string[];
  onToggle: (tag: string) => void;
};

export function TagFilterList({ selectedTags, onToggle }: TagFilterListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ total: number; tags: Tag[] }>(routes.tags.aggregations())
      .then((data) => setTags(data.tags))
      .catch(() => setTags(FALLBACK_TAGS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 mt-3">Loading tags…</p>;
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag.name);
        const color = getTagColor(tag.name);
        return (
          <button
            key={tag.name}
            onClick={() => onToggle(tag.name)}
            aria-pressed={selected}
            className={`m-px px-3 py-1 rounded-full text-sm font-medium transition-all ${selected ? "opacity-100" : "opacity-75 hover:opacity-90 active:scale-90 active:opacity-60"}`}
            style={{
              backgroundColor: color,
              color: "white",
              ...(selected ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${color}` } : {}),
            }}
          >
            {tag.name}
            <span className="ml-1.5 text-xs opacity-70">{tag.count}</span>
          </button>
        );
      })}
    </div>
  );
}
