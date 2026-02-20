/**
 * Helper functions for comment display
 */

// Color palette that matches the blog theme (lighter shades)
const AVATAR_COLORS = [
  "#9CA3AF", // light gray
  "#A78BFA", // light purple
  "#60A5FA", // light blue
  "#34D399", // light green
  "#FBBF24", // light amber
  "#F87171", // light red
  "#F472B6", // light pink
  "#2DD4BF", // light teal
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
