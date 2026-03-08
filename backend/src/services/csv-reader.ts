/**
 * Service for reading and parsing travel data from CSV file.
 */

import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";
import { TravelEntry } from "../models";
import { travelEntrySchema } from "../schemas";

const EXPECTED_HEADERS = [
  "date",
  "country",
  "city",
  "hotel",
  "flight",
  "rental_car",
  "notes",
];

export async function readTravelCSV(): Promise<TravelEntry[]> {
  const csvPath = path.join(__dirname, "../../data/travel-itinerary.csv");

  let fileContent: string;
  try {
    fileContent = await fs.readFile(csvPath, "utf-8");
  } catch (error) {
    throw new Error(
      `Travel CSV file not found at ${csvPath}. Please ensure backend/data/travel-itinerary.csv exists.`,
    );
  }

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parsing errors:", parsed.errors);
    throw new Error(`Failed to parse travel CSV: ${parsed.errors[0].message}`);
  }

  // Validate headers - check if required headers exist (case-insensitive)
  const data = parsed.data as Record<string, string>[];
  if (data.length === 0) {
    return [];
  }

  const csvHeaders = Object.keys(data[0]).map((h) => h.toLowerCase().trim());
  const expectedLower = EXPECTED_HEADERS.map((h) => h.toLowerCase());

  // Check that all required headers exist
  const missingHeaders = expectedLower.filter(
    (header) => !csvHeaders.includes(header),
  );
  if (missingHeaders.length > 0) {
    throw new Error(
      `CSV is missing required headers: ${missingHeaders.join(", ")}. Expected: ${EXPECTED_HEADERS.join(", ")}`,
    );
  }

  const entries: TravelEntry[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Normalize keys to lowercase and filter to only expected headers
    const normalizedRow: Record<string, string | null> = {};
    for (const expectedHeader of EXPECTED_HEADERS) {
      const lowerExpected = expectedHeader.toLowerCase();
      // Find the matching key in the row (case-insensitive)
      const matchingKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === lowerExpected,
      );
      if (matchingKey !== undefined) {
        const value = row[matchingKey];
        normalizedRow[lowerExpected] =
          value && value.trim() ? value.trim() : null;
      } else {
        normalizedRow[lowerExpected] = null;
      }
    }

    // Skip rows that don't have required fields (date, country, city)
    if (!normalizedRow.date || !normalizedRow.country || !normalizedRow.city) {
      console.log(`Skipping row ${i + 2}: missing required fields`);
      continue;
    }

    // Parse human-readable dates like "Thursday, December 18" to ISO format
    let dateValue = normalizedRow.date;

    // Parse human-readable dates like "Thursday, December 18" to ISO format
    if (dateValue && !dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        // Assume dates are in current year (2026) if not specified
        const currentYear = 2026;
        const parsedDate = new Date(`${dateValue}, ${currentYear}`);
        if (!isNaN(parsedDate.getTime())) {
          dateValue = parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
        }
      } catch (error) {
        // If parsing fails, keep original value and let validation handle it
        console.warn(`Could not parse date "${dateValue}", using as-is`);
      }
    }

    const entry = {
      date: dateValue,
      country: normalizedRow.country || "",
      city: normalizedRow.city || "",
      hotel: normalizedRow.hotel || null,
      flight: normalizedRow.flight || null,
      rental_car: normalizedRow.rental_car || null,
      notes: normalizedRow.notes || null,
    };

    try {
      const validated = travelEntrySchema.parse(entry);
      entries.push(validated);
    } catch (error) {
      console.error(`Validation error at row ${i + 2}:`, error);
      throw new Error(
        `Invalid data at row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Sort by date ascending
  entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return entries;
}
