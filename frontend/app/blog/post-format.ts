/**
 * Pure, browser-safe formatting helpers for blog post display.
 * Kept separate from utils.tsx so client components can import without
 * pulling in Node.js `fs`.
 */

export function getTagColor(tag: string) {
  const tagLower = tag.toLowerCase();
  if (tagLower === "camping") return "#8b7dd8";
  if (tagLower === "food") return "#e685a0";
  if (tagLower === "hiking") return "#6ba3f5";
  if (tagLower === "safari") return "#7bc99d";
  if (tagLower === "itinerary") return "#7b9ae0";
  if (tagLower === "city guide") return "#7abcca";
  if (tagLower === "travel tips") return "#c49a6a";
  return "#7b9ae0";
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
