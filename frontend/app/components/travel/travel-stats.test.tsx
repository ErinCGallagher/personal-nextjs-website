/** Tests for TravelStats component. */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TravelStats from "./travel-stats";
import type { TravelEntry } from "./calendar-utils";

function makeEntry(
  date: string,
  country: string,
  city: string
): TravelEntry {
  return { date, country, city, hotel: null, flight: null, rental_car: null, notes: null };
}

describe("TravelStats", () => {
  it("shows zero stats for empty travels", () => {
    render(<TravelStats travels={[]} />);
    const zeros = screen.getAllByText("0");
    // countries, cities, days, longest stay all show 0
    expect(zeros).toHaveLength(4);
  });

  it("counts unique countries", () => {
    const travels = [
      makeEntry("2026-06-01", "Japan", "Tokyo"),
      makeEntry("2026-06-02", "Japan", "Kyoto"),
      makeEntry("2026-06-03", "Thailand", "Bangkok"),
    ];
    render(<TravelStats travels={travels} />);
    const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
    expect(stats).toContain("2"); // 2 countries
  });

  it("counts unique cities", () => {
    const travels = [
      makeEntry("2026-06-01", "Japan", "Tokyo"),
      makeEntry("2026-06-02", "Japan", "Tokyo"),
      makeEntry("2026-06-03", "Japan", "Kyoto"),
    ];
    render(<TravelStats travels={travels} />);
    const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
    expect(stats).toContain("2"); // 2 cities
  });

  it("counts total days", () => {
    const travels = [
      makeEntry("2026-06-01", "Japan", "Tokyo"),
      makeEntry("2026-06-02", "Japan", "Tokyo"),
      makeEntry("2026-06-03", "Thailand", "Bangkok"),
    ];
    render(<TravelStats travels={travels} />);
    const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
    expect(stats).toContain("3"); // 3 days
  });

  it("calculates longest consecutive stay at a location", () => {
    const travels = [
      makeEntry("2026-06-01", "Japan", "Tokyo"),
      makeEntry("2026-06-02", "Japan", "Tokyo"),
      makeEntry("2026-06-03", "Japan", "Tokyo"),
      makeEntry("2026-06-04", "Thailand", "Bangkok"),
      makeEntry("2026-06-05", "Thailand", "Bangkok"),
    ];
    render(<TravelStats travels={travels} />);
    const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
    expect(stats).toContain("3"); // longest stay is 3 days in Tokyo
  });

  it("shows the location name for longest stay", () => {
    const travels = [
      makeEntry("2026-06-01", "Japan", "Tokyo"),
      makeEntry("2026-06-02", "Japan", "Tokyo"),
      makeEntry("2026-06-03", "Japan", "Tokyo"),
    ];
    render(<TravelStats travels={travels} />);
    expect(screen.getByText("Tokyo, Japan")).toBeTruthy();
  });

  it("handles a single entry as a stay of 1", () => {
    render(<TravelStats travels={[makeEntry("2026-06-01", "Japan", "Tokyo")]} />);
    const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
    expect(stats).toContain("1");
  });
});
