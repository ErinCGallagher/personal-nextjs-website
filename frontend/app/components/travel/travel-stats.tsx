/**
 * Travel statistics component showing summary counts for a set of travel entries.
 */

"use client";

import { FaGlobeAmericas, FaCity, FaCalendar, FaHotel, FaCar, FaBed, FaPlane } from "react-icons/fa";
import type { TravelEntry } from "./calendar-utils";

interface TravelStatsProps {
  travels: TravelEntry[];
}

/** Returns the country with the highest total day count and how many days. */
function computeMostTimeIn(travels: TravelEntry[]): { country: string; days: number } {
  const counts: Record<string, number> = {};
  travels.forEach((t) => {
    counts[t.country] = (counts[t.country] ?? 0) + 1;
  });
  let top = { country: "", days: 0 };
  for (const [country, days] of Object.entries(counts)) {
    if (days > top.days) top = { country, days };
  }
  return top;
}

/**
 * Counts distinct beds slept in. Each consecutive run of the same hotel name is one bed.
 * A null entry breaks a run, so the same name reappearing after a null counts as a new bed.
 */
function computeBedsSleptIn(travels: TravelEntry[]): number {
  let beds = 0;
  let lastHotel: string | null = null;
  let nullSinceLast = false;

  travels.forEach((travel) => {
    if (travel.hotel === null) {
      nullSinceLast = true;
    } else {
      if (travel.hotel !== lastHotel || nullSinceLast) {
        beds++;
      }
      lastHotel = travel.hotel;
      nullSinceLast = false;
    }
  });

  return beds;
}

function computeLongestStay(travels: TravelEntry[]): { location: string; days: number } {
  let longest = { location: "", days: 0 };
  let current = { location: "", days: 0 };

  travels.forEach((travel, index) => {
    const location = `${travel.city}, ${travel.country}`;
    const prevLocation =
      index > 0
        ? `${travels[index - 1].city}, ${travels[index - 1].country}`
        : "";

    if (index === 0 || location === prevLocation) {
      current.location = location;
      current.days += 1;
    } else {
      if (current.days > longest.days) {
        longest = { ...current };
      }
      current = { location, days: 1 };
    }
  });

  if (current.days > longest.days) {
    longest = current;
  }

  return longest;
}

export default function TravelStats({ travels }: TravelStatsProps) {
  const uniqueCountries = new Set(travels.map((t) => t.country));
  const uniqueCities = new Set(travels.map((t) => t.city));
  const totalDays = travels.length;
  const mostTimeIn = computeMostTimeIn(travels);
  const totalFlights = travels.reduce((sum, t) => {
    if (!t.flight) return sum;
    return sum + t.flight.split("-").length - 1;
  }, 0);
  const rentalCarDays = travels.filter((t) => t.rental_car !== null).length;
  const bedsSleptIn = computeBedsSleptIn(travels);
  const longestStay = computeLongestStay(travels);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaGlobeAmericas className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{uniqueCountries.size}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">Countries</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaCity className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{uniqueCities.size}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">
            Places
            <span className="block text-xs">(city or town)</span>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaCalendar className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{totalDays}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">Days Traveled</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaGlobeAmericas className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{mostTimeIn.days}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">
            Most Time In
            {mostTimeIn.country && (
              <span className="block text-xs">{mostTimeIn.country}</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaPlane className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{totalFlights}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">Flights</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaBed className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{bedsSleptIn}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">
            Beds Slept In
            {bedsSleptIn > 0 && (
              <span className="block text-xs">(avg {(totalDays / bedsSleptIn).toFixed(1)} nights/bed)</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaCar className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{rentalCarDays}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">Rental Car Days</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaHotel className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{longestStay.days}</div>
          <div className="text-sm md:text-base text-grey-blue mt-0.5 md:mt-0">
            Longest Stay
            {longestStay.location && (
              <span className="block text-xs">{longestStay.location}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
