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
    // countries, cities, days, most time in, flights, beds, rental car days, longest stay all show 0
    expect(zeros).toHaveLength(8);
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

  it("counts days with a rental car", () => {
    const travels: TravelEntry[] = [
      { ...makeEntry("2026-06-01", "Japan", "Tokyo"), rental_car: "Toyota Corolla" },
      { ...makeEntry("2026-06-02", "Japan", "Tokyo"), rental_car: "Toyota Corolla" },
      makeEntry("2026-06-03", "Japan", "Kyoto"),
    ];
    render(<TravelStats travels={travels} />);
    expect(screen.getByText("Rental Car Days")).toBeTruthy();
    const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
    expect(stats).toContain("2");
  });

  describe("flights", () => {
    function withFlight(entry: TravelEntry, flight: string | null): TravelEntry {
      return { ...entry, flight };
    }

    it("counts a single-leg flight as 1", () => {
      const travels = [withFlight(makeEntry("2026-06-01", "Japan", "Tokyo"), "DUB-YYZ")];
      render(<TravelStats travels={travels} />);
      expect(screen.getByText("Flights")).toBeTruthy();
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("1");
    });

    it("counts a multi-leg flight string by number of dashes", () => {
      const travels = [withFlight(makeEntry("2026-06-01", "Japan", "Tokyo"), "ABS-ASW-CAI")];
      render(<TravelStats travels={travels} />);
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("2");
    });

    it("sums flights across multiple entries", () => {
      const travels = [
        withFlight(makeEntry("2026-06-01", "Japan", "Tokyo"), "DUB-YYZ"),
        withFlight(makeEntry("2026-06-02", "Japan", "Tokyo"), null),
        withFlight(makeEntry("2026-06-03", "Japan", "Kyoto"), "ABS-ASW-CAI"),
      ];
      render(<TravelStats travels={travels} />);
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("3");
    });

    it("shows zero flights when none present", () => {
      render(<TravelStats travels={[makeEntry("2026-06-01", "Japan", "Tokyo")]} />);
      expect(screen.getByText("Flights")).toBeTruthy();
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("0");
    });
  });

  describe("most time in", () => {
    it("shows the country with the most days", () => {
      const travels = [
        makeEntry("2026-06-01", "Japan", "Tokyo"),
        makeEntry("2026-06-02", "Japan", "Kyoto"),
        makeEntry("2026-06-03", "Japan", "Osaka"),
        makeEntry("2026-06-04", "Thailand", "Bangkok"),
        makeEntry("2026-06-05", "Thailand", "Chiang Mai"),
      ];
      render(<TravelStats travels={travels} />);
      expect(screen.getByText("Most Time In")).toBeTruthy();
      expect(screen.getByText("Japan")).toBeTruthy();
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("3");
    });

    it("shows nothing when travels is empty", () => {
      render(<TravelStats travels={[]} />);
      expect(screen.getByText("Most Time In")).toBeTruthy();
    });
  });

  it("shows zero rental car days when none present", () => {
    render(<TravelStats travels={[makeEntry("2026-06-01", "Japan", "Tokyo")]} />);
    expect(screen.getByText("Rental Car Days")).toBeTruthy();
  });

  describe("beds slept in", () => {
    function withHotel(entry: TravelEntry, hotel: string | null): TravelEntry {
      return { ...entry, hotel };
    }

    it("counts consecutive same-hotel nights as one bed", () => {
      const travels = [
        withHotel(makeEntry("2026-06-01", "Japan", "Tokyo"), "Hotel A"),
        withHotel(makeEntry("2026-06-02", "Japan", "Tokyo"), "Hotel A"),
        withHotel(makeEntry("2026-06-03", "Japan", "Tokyo"), "Hotel A"),
      ];
      render(<TravelStats travels={travels} />);
      expect(screen.getByText("Beds Slept In")).toBeTruthy();
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("1");
    });

    it("counts a hotel change as a new bed", () => {
      const travels = [
        withHotel(makeEntry("2026-06-01", "Japan", "Tokyo"), "Hotel A"),
        withHotel(makeEntry("2026-06-02", "Japan", "Tokyo"), "Hotel B"),
      ];
      render(<TravelStats travels={travels} />);
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("2");
    });

    it("counts same hotel name as a new bed when not consecutive", () => {
      const travels = [
        withHotel(makeEntry("2026-06-01", "Japan", "Tokyo"), "Airbnb"),
        withHotel(makeEntry("2026-06-02", "Japan", "Tokyo"), "Airbnb"),
        withHotel(makeEntry("2026-06-03", "Japan", "Kyoto"), null),
        withHotel(makeEntry("2026-06-04", "Japan", "Osaka"), "Airbnb"),
      ];
      render(<TravelStats travels={travels} />);
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("2");
    });

    it("does not count null hotel entries as beds", () => {
      const travels = [
        withHotel(makeEntry("2026-06-01", "Japan", "Tokyo"), null),
        withHotel(makeEntry("2026-06-02", "Japan", "Tokyo"), null),
      ];
      render(<TravelStats travels={travels} />);
      const stats = screen.getAllByText(/^\d+$/).map((el) => el.textContent);
      expect(stats).toContain("0");
    });
  });
});
