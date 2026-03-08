/**
 * Utility functions for generating consistent colours from strings.
 * Used for colour-coding countries in the travel visualization.
 */

/** Generate deterministic colour from country name */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getCountryColor(country: string): string {
  // Use golden ratio to distribute hues evenly across spectrum
  const hash = hashString(country);
  const hue = (hash * 137.508) % 360; // Golden angle for better distribution
  return `hsl(${hue}, 70%, 75%)`; // Pastel colours for readability
}

export function getCountryBorderColor(country: string): string {
  // Use same hue calculation for consistency
  const hash = hashString(country);
  const hue = (hash * 137.508) % 360; // Golden angle for better distribution
  return `hsl(${hue}, 70%, 40%)`; // Darker for borders
}
