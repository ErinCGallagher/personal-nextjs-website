/**
 * Country legend component displaying colour-coded countries.
 * Shows a visual key mapping countries to their assigned colours.
 */

"use client";

import { getCountryColor } from "@/app/lib/color-utils";

interface CountryLegendProps {
  countries: string[];
}

export default function CountryLegend({ countries }: CountryLegendProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {countries.map((country) => (
        <div key={country} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getCountryColor(country) }}
          />
          <span className="text-sm text-foreground">{country}</span>
        </div>
      ))}
    </div>
  );
}
