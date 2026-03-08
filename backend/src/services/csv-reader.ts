/**
 * Service for reading and parsing travel data from CSV file.
 */

import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";
import { TravelEntry } from "../models";
import { travelEntrySchema } from "../schemas";

const EXPECTED_HEADERS = ["date", "country", "city", "hotel", "notes"];

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

  if (!expectedLower.every((header) => csvHeaders.includes(header))) {
    throw new Error(
      `CSV headers do not match expected format. Expected: ${EXPECTED_HEADERS.join(", ")}, Got: ${csvHeaders.join(", ")}`,
    );
  }

  const entries: TravelEntry[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Normalize keys to lowercase for case-insensitive matching
    const normalizedRow: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(row)) {
      const lowerKey = key.toLowerCase().trim();
      normalizedRow[lowerKey] = value && value.trim() ? value.trim() : null;
    }

    // Extract and validate fields
    const entry = {
      date: normalizedRow.date || "",
      country: normalizedRow.country || "",
      city: normalizedRow.city || "",
      hotel: normalizedRow.hotel || null,
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
