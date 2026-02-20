/**
 * Helper functions for comment display
 */

// Color palette that matches the blog theme
const AVATAR_COLORS = [
  "#6B7280", // gray
  "#8B5CF6", // purple (grey-blue variant)
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#14B8A6", // teal
];

/**
 * Extracts initials from a name
 * Single name: "John" -> "J"
 * Multiple names: "John Doe" -> "JD"
 */
export function getInitials(name: string | undefined): string {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

/**
 * Gets a consistent color for a user based on their ID
 * Same user will always get the same color
 */
export function getAvatarColor(userId: string): string {
  // Simple hash function to convert UUID to number
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value and modulo to get consistent index
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Formats date as "Dec 25, 2026"
 */
export function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
