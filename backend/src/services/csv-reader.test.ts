/**
 * Unit tests for CSV reader functionality.
 * Tests CSV parsing, validation, and data transformation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import { readTravelCSV } from "./csv-reader";

// Mock fs and path modules
vi.mock("fs/promises");
vi.mock("path");

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

describe("readTravelCSV", () => {
  const mockCsvPath = "/mock/path/travel-itinerary.csv";

  beforeEach(() => {
    vi.clearAllMocks();
    mockPath.join.mockReturnValue(mockCsvPath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully parses valid CSV with all required columns", async () => {
    const csvContent = `date,country,city,hotel,notes
2026-01-01,USA,New York,Hotel A,Great stay
2026-01-02,Canada,Toronto,Hotel B,Amazing city`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: "2026-01-01",
      country: "USA",
      city: "New York",
      hotel: "Hotel A",
      notes: "Great stay",
    });
    expect(result[1]).toEqual({
      date: "2026-01-02",
      country: "Canada",
      city: "Toronto",
      hotel: "Hotel B",
      notes: "Amazing city",
    });
  });

  it("parses human-readable dates to ISO format", async () => {
    const csvContent = `date,country,city,hotel,notes
"Thursday, January 1",USA,New York,Hotel A,Great stay
"Friday, January 2",Canada,Toronto,Hotel B,Amazing city`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2026-01-01");
    expect(result[1].date).toBe("2026-01-02");
  });

  it("filters out extra columns and only processes expected headers", async () => {
    const csvContent = `date,country,city,hotel,notes,extra_col1,extra_col2
2026-01-01,USA,New York,Hotel A,Great stay,ignore,this
2026-01-02,Canada,Toronto,Hotel B,Amazing city,also,ignore`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: "2026-01-01",
      country: "USA",
      city: "New York",
      hotel: "Hotel A",
      notes: "Great stay",
    });
    // Extra columns should not appear in the result
    expect(result[0]).not.toHaveProperty("extra_col1");
    expect(result[0]).not.toHaveProperty("extra_col2");
  });

  it("handles case-insensitive header matching", async () => {
    const csvContent = `Date,Country,CITY,Hotel,NOTES
2026-01-01,USA,New York,Hotel A,Great stay`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: "2026-01-01",
      country: "USA",
      city: "New York",
      hotel: "Hotel A",
      notes: "Great stay",
    });
  });

  it("skips rows with missing required fields", async () => {
    const csvContent = `date,country,city,hotel,notes
2026-01-01,USA,New York,Hotel A,Great stay
2026-01-02,,Toronto,Hotel B,Amazing city
2026-01-03,Canada,,Hotel C,Good place
2026-01-04,France,Paris,Hotel D,Wonderful`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(2);
    expect(result[0].country).toBe("USA");
    expect(result[1].country).toBe("France");
  });

  it("handles nullable hotel and notes fields", async () => {
    const csvContent = `date,country,city,hotel,notes
2026-01-01,USA,New York,,Great stay
2026-01-02,Canada,Toronto,Hotel B,
2026-01-03,France,Paris,,
2026-01-04,UK,London,,`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(4);
    expect(result[0].hotel).toBeNull();
    expect(result[0].notes).toBe("Great stay");
    expect(result[1].hotel).toBe("Hotel B");
    expect(result[1].notes).toBeNull();
    expect(result[2].hotel).toBeNull();
    expect(result[2].notes).toBeNull();
  });

  it("sorts entries by date ascending", async () => {
    const csvContent = `date,country,city,hotel,notes
2026-01-03,France,Paris,Hotel C,Third
2026-01-01,USA,New York,Hotel A,First
2026-01-02,Canada,Toronto,Hotel B,Second`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(3);
    expect(result[0].country).toBe("USA");
    expect(result[1].country).toBe("Canada");
    expect(result[2].country).toBe("France");
  });

  it("throws error when CSV file is not found", async () => {
    mockFs.readFile.mockRejectedValue(new Error("ENOENT: no such file"));

    await expect(readTravelCSV()).rejects.toThrow("Travel CSV file not found");
  });

  it("throws error when required headers are missing", async () => {
    const csvContent = `date,country,wrong_header,hotel,notes
2026-01-01,USA,New York,Hotel A,Great stay`;

    mockFs.readFile.mockResolvedValue(csvContent);

    await expect(readTravelCSV()).rejects.toThrow(
      "CSV is missing required headers: city",
    );
  });

  it("throws error when CSV parsing fails", async () => {
    // Invalid CSV that would cause Papa Parse to fail
    const invalidCsvContent = `"unclosed quote,date,country
2026-01-01,USA,New York`;

    mockFs.readFile.mockResolvedValue(invalidCsvContent);

    await expect(readTravelCSV()).rejects.toThrow("Failed to parse travel CSV");
  });

  it("returns empty array for empty CSV after headers", async () => {
    const csvContent = `date,country,city,hotel,notes`;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toEqual([]);
  });

  it("handles whitespace trimming in values", async () => {
    const csvContent = `date,country,city,hotel,notes
  2026-01-01  ,  USA  ,  New York  ,  Hotel A  ,  Great stay  `;

    mockFs.readFile.mockResolvedValue(csvContent);

    const result = await readTravelCSV();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: "2026-01-01",
      country: "USA",
      city: "New York",
      hotel: "Hotel A",
      notes: "Great stay",
    });
  });

  it("validates data against Zod schema", async () => {
    const csvContent = `date,country,city,hotel,notes
2026-13-45,USA,New York,Hotel A,Great stay`;

    mockFs.readFile.mockResolvedValue(csvContent);

    await expect(readTravelCSV()).rejects.toThrow("Invalid data at row 2");
  });
});
