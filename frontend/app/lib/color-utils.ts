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

/** Map country names to ISO 3166-1 alpha-2 codes */
const countryCodeMap: Record<string, string> = {
  Japan: "JP",
  Thailand: "TH",
  Vietnam: "VN",
  Cambodia: "KH",
  Laos: "LA",
  Myanmar: "MM",
  Singapore: "SG",
  Malaysia: "MY",
  Indonesia: "ID",
  Philippines: "PH",
  "South Korea": "KR",
  "South Africa": "ZA",
  Australia: "AU",
  "New Zealand": "NZ",
  France: "FR",
  Germany: "DE",
  Italy: "IT",
  Spain: "ES",
  Portugal: "PT",
  Greece: "GR",
  Netherlands: "NL",
  Belgium: "BE",
  Switzerland: "CH",
  Austria: "AT",
  "United Kingdom": "GB",
  England: "GB",
  Scotland: "GB",
  Wales: "GB",
  Ireland: "IE",
  Iceland: "IS",
  Norway: "NO",
  Sweden: "SE",
  Denmark: "DK",
  Finland: "FI",
  Poland: "PL",
  "Czech Republic": "CZ",
  Hungary: "HU",
  Croatia: "HR",
  Turkey: "TR",
  Egypt: "EG",
  Morocco: "MA",
  Kenya: "KE",
  Tanzania: "TZ",
  "United States": "US",
  USA: "US",
  Canada: "CA",
  Mexico: "MX",
  Brazil: "BR",
  Argentina: "AR",
  Chile: "CL",
  Peru: "PE",
  Colombia: "CO",
  "Costa Rica": "CR",
  India: "IN",
  Nepal: "NP",
  Bhutan: "BT",
  "Sri Lanka": "LK",
  China: "CN",
  "Hong Kong": "HK",
  Taiwan: "TW",
  UAE: "AE",
  Israel: "IL",
  Jordan: "JO",
};

/**
 * Convert ISO country code to flag emoji
 * Flag emojis are created using regional indicator symbols
 */
function countryCodeToFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Get flag emoji for a country name
 * Returns empty string if country not found in map
 */
export function getCountryFlag(country: string): string {
  const code = countryCodeMap[country];
  return code ? countryCodeToFlag(code) : "";
}
