/**
 * Travel statistics component showing summary counts for a set of travel entries.
 * Always reflects total (unfiltered) data regardless of active filters.
 */

"use client";

import { FaGlobeAmericas, FaCity, FaCalendar, FaHotel } from "react-icons/fa";
import type { TravelEntry } from "./calendar-utils";

interface TravelStatsProps {
  travels: TravelEntry[];
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
  const uniqueCities = new Set(travels.map((t) => `${t.city}, ${t.country}`));
  const totalDays = travels.length;
  const longestStay = computeLongestStay(travels);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaGlobeAmericas className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{uniqueCountries.size}</div>
          <div className="text-xs text-grey-blue mt-0.5 md:mt-0">Countries</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaCity className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{uniqueCities.size}</div>
          <div className="text-xs text-grey-blue mt-0.5 md:mt-0">Cities</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaCalendar className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{totalDays}</div>
          <div className="text-xs text-grey-blue mt-0.5 md:mt-0">Days</div>
        </div>
      </div>

      <div className="bg-white px-4 py-3 rounded-lg border flex items-center gap-3">
        <FaHotel className="text-light-blue text-xl shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <div className="text-2xl font-bold text-foreground leading-none">{longestStay.days}</div>
          <div className="text-xs text-grey-blue mt-0.5 md:mt-0">
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
