/** Shared date formatting utilities. */

/**
 * Formats a date string as YYYY-MM-DD.
 * Used in contexts where a compact, sortable date is needed (e.g. admin tables).
 */
export function formatDateISO(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
