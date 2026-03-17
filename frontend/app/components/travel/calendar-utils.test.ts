/** Tests for calendar utility functions */

import { describe, it, expect } from "vitest";
import {
  groupTravelsByMonth,
  getAvailableMonths,
  getTravelForDate,
  getStayPosition,
  getMonthData,
} from "./calendar-utils";
import type { TravelEntry } from "./calendar-utils";

function makeEntry(date: string, country: string, city: string): TravelEntry {
  return { date, country, city, hotel: null, flight: null, rental_car: null, notes: null };
}

// "2024-03-02" parses as UTC midnight; toISOString().split("T")[0] reliably returns "2024-03-02"
const march1 = new Date("2024-03-01");
const march2 = new Date("2024-03-02");
const march3 = new Date("2024-03-03");

describe("groupTravelsByMonth", () => {
  it("groups entries by YYYY-MM key", () => {
    // Use mid-month dates to avoid UTC-midnight timezone boundary issues
    const travels = [
      makeEntry("2024-03-10", "France", "Paris"),
      makeEntry("2024-03-15", "France", "Lyon"),
      makeEntry("2024-04-10", "Italy", "Rome"),
    ];
    const result = groupTravelsByMonth(travels);
    expect(Object.keys(result)).toEqual(["2024-03", "2024-04"]);
    expect(result["2024-03"]).toHaveLength(2);
    expect(result["2024-04"]).toHaveLength(1);
  });

  it("returns an empty object for an empty array", () => {
    expect(groupTravelsByMonth([])).toEqual({});
  });
});

describe("getAvailableMonths", () => {
  it("returns months sorted chronologically", () => {
    const travelsByMonth = {
      "2024-04": [makeEntry("2024-04-01", "Italy", "Rome")],
      "2024-03": [makeEntry("2024-03-01", "France", "Paris")],
    };
    const months = getAvailableMonths(travelsByMonth);
    expect(months[0].getMonth()).toBe(2); // March (0-indexed)
    expect(months[1].getMonth()).toBe(3); // April
  });

  it("returns an empty array for an empty object", () => {
    expect(getAvailableMonths({})).toEqual([]);
  });
});

describe("getTravelForDate", () => {
  const travels = [
    makeEntry("2024-03-01", "France", "Paris"),
    makeEntry("2024-03-03", "Germany", "Berlin"),
  ];

  it("returns the matching entry for a date", () => {
    const result = getTravelForDate(march1, travels);
    expect(result?.country).toBe("France");
  });

  it("returns null when no entry matches the date", () => {
    const result = getTravelForDate(march2, travels);
    expect(result).toBeNull();
  });
});

describe("getStayPosition", () => {
  it("returns 'single' when the stay is one day only", () => {
    const travels = [makeEntry("2024-03-02", "France", "Paris")];
    expect(getStayPosition(march2, travels)).toBe("single");
  });

  it("returns 'start' when only the next day has the same location", () => {
    const travels = [
      makeEntry("2024-03-02", "France", "Paris"),
      makeEntry("2024-03-03", "France", "Paris"),
    ];
    expect(getStayPosition(march2, travels)).toBe("start");
  });

  it("returns 'end' when only the previous day has the same location", () => {
    const travels = [
      makeEntry("2024-03-01", "France", "Paris"),
      makeEntry("2024-03-02", "France", "Paris"),
    ];
    expect(getStayPosition(march2, travels)).toBe("end");
  });

  it("returns 'middle' when both adjacent days have the same location", () => {
    const travels = [
      makeEntry("2024-03-01", "France", "Paris"),
      makeEntry("2024-03-02", "France", "Paris"),
      makeEntry("2024-03-03", "France", "Paris"),
    ];
    expect(getStayPosition(march2, travels)).toBe("middle");
  });

  it("returns 'single' when adjacent days have a different location", () => {
    const travels = [
      makeEntry("2024-03-01", "Germany", "Berlin"),
      makeEntry("2024-03-02", "France", "Paris"),
      makeEntry("2024-03-03", "Italy", "Rome"),
    ];
    expect(getStayPosition(march2, travels)).toBe("single");
  });

  it("returns 'single' when the date has no entry", () => {
    const travels = [makeEntry("2024-03-01", "France", "Paris")];
    expect(getStayPosition(march2, travels)).toBe("single");
  });
});

describe("getMonthData", () => {
  const entries = [
    makeEntry("2024-03-05", "France", "Paris"),
    makeEntry("2024-03-01", "Germany", "Berlin"),
  ];

  // Use new Date(year, month-1, day) for local-time construction to avoid
  // UTC-midnight timezone boundary issues when computing year/month keys
  it("returns null when there are no entries for the month", () => {
    expect(getMonthData(new Date(2024, 3, 1), { "2024-03": entries })).toBeNull();
  });

  it("returns entries sorted by date", () => {
    const result = getMonthData(new Date(2024, 2, 1), { "2024-03": entries });
    expect(result?.entries[0].date).toBe("2024-03-01");
    expect(result?.entries[1].date).toBe("2024-03-05");
  });

  it("returns correct daysInMonth for March", () => {
    const result = getMonthData(new Date(2024, 2, 1), { "2024-03": entries });
    expect(result?.daysInMonth).toBe(31);
  });

  it("returns the formatted month name", () => {
    const result = getMonthData(new Date(2024, 2, 1), { "2024-03": entries });
    expect(result?.monthName).toContain("March");
    expect(result?.monthName).toContain("2024");
  });
});
