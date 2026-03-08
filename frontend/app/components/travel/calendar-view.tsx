/**
 * Calendar view component for travel visualization.
 * Displays travel entries in a month-by-month calendar format.
 */

"use client";

import { useState, useEffect } from "react";
import { getCountryColor, getCountryBorderColor } from "@/app/lib/color-utils";

interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  flight: string | null;
  rental_car: string | null;
  notes: string | null;
}

interface CalendarViewProps {
  travels: TravelEntry[];
}

interface MonthData {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  firstDayOfWeek: number;
  entries: TravelEntry[];
}

export default function CalendarView({ travels }: CalendarViewProps) {
  const [selectedTravel, setSelectedTravel] = useState<TravelEntry | null>(
    null,
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Group travels by month
  const travelsByMonth = travels.reduce(
    (acc, travel) => {
      const date = new Date(travel.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!acc[yearMonth]) {
        acc[yearMonth] = [];
      }
      acc[yearMonth].push(travel);
      return acc;
    },
    {} as Record<string, TravelEntry[]>,
  );

  // Get all available months
  const availableMonths = Object.keys(travelsByMonth)
    .sort()
    .map((yearMonth) => {
      const [year, month] = yearMonth.split("-").map(Number);
      return new Date(year, month - 1, 1);
    });

  // Set default to current month if it has travel data, otherwise first available month
  useEffect(() => {
    if (availableMonths.length > 0) {
      const currentYearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
      const hasCurrentMonthData = travelsByMonth[currentYearMonth];

      if (!hasCurrentMonthData) {
        // If current month has no data, find the closest month with data
        const currentTime = currentMonth.getTime();
        const closestMonth = availableMonths.reduce((closest, month) => {
          return Math.abs(month.getTime() - currentTime) <
            Math.abs(closest.getTime() - currentTime)
            ? month
            : closest;
        });
        setCurrentMonth(closestMonth);
      }
    }
  }, [travels, currentMonth, travelsByMonth, availableMonths]);

  // Create month data for current month
  const getCurrentMonthData = (): MonthData | null => {
    const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
    const monthEntries = travelsByMonth[yearMonth];

    if (!monthEntries) return null;

    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfWeek = date.getDay();

    return {
      year: currentMonth.getFullYear(),
      month: currentMonth.getMonth(),
      monthName: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
      daysInMonth,
      firstDayOfWeek,
      entries: monthEntries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    };
  };

  // Helper function to match travel to date
  function getTravelForDate(
    date: Date,
    travels: TravelEntry[],
  ): TravelEntry | null {
    const dateStr = date.toISOString().split("T")[0];
    return travels.find((t) => t.date === dateStr) || null;
  }

  const monthData = getCurrentMonthData();

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const goToMonth = (month: Date) => {
    setCurrentMonth(month);
  };

  if (!monthData) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/60">
          No travel data for{" "}
          {currentMonth.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
        </p>
        <div className="mt-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="mr-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Previous Month
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next Month
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center space-x-4">
          <h3 className="text-lg sm:text-xl font-semibold">
            {monthData.monthName}
          </h3>
          <span className="text-xs sm:text-sm text-foreground/60">
            {monthData.entries.length} travel{" "}
            {monthData.entries.length === 1 ? "day" : "days"}
          </span>
        </div>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableMonths.map((month, index) => {
          const isSelected =
            month.getFullYear() === currentMonth.getFullYear() &&
            month.getMonth() === currentMonth.getMonth();
          return (
            <button
              key={index}
              onClick={() => goToMonth(month)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {month.toLocaleDateString("en-US", {
                month: "long",
              })}
            </button>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="hidden sm:grid grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-700 py-2 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Empty cells for days before the first day of the month (hidden on mobile) */}
          {Array.from({ length: monthData.firstDayOfWeek }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="hidden sm:block min-h-[100px] bg-gray-50 rounded"
            ></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: monthData.daysInMonth }, (_, day) => {
            const dayNumber = day + 1;
            const dayDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              dayNumber,
            );
            const travel = getTravelForDate(dayDate, monthData.entries);
            const today = new Date();
            const isToday =
              dayDate.getDate() === today.getDate() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getFullYear() === today.getFullYear();

            return (
              <div
                key={dayNumber}
                className={`min-h-[80px] sm:min-h-[100px] border rounded p-1 sm:p-2 relative cursor-pointer hover:opacity-90 transition-opacity ${
                  travel ? "bg-blue-50 border-blue-200" : "bg-white"
                } ${isToday ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`}
                style={{
                  backgroundColor: travel
                    ? getCountryColor(travel.country)
                    : undefined,
                }}
                onClick={() => travel && setSelectedTravel(travel)}
              >
                <div className="font-medium text-xs sm:text-sm mb-1">
                  {dayNumber}
                  <span className="sm:hidden text-gray-600 ml-1">
                    ({dayDate.toLocaleDateString("en-US", { weekday: "short" })}
                    )
                  </span>
                </div>

                {travel && (
                  <div className="text-xs sm:text-xs text-gray-900">
                    <div className="font-medium text-xs">{travel.country}</div>
                    <div className="text-gray-800 text-xs">{travel.city}</div>
                    {travel.notes && (
                      <div className="text-gray-700 mt-0.5 text-xs">📝</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Notes Modal */}
      {selectedTravel && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTravel(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  {new Date(selectedTravel.date).toLocaleDateString("en-CA", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <button
                  onClick={() => setSelectedTravel(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-medium">
                    {selectedTravel.city}, {selectedTravel.country}
                  </div>
                </div>

                {selectedTravel.hotel && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Hotel</div>
                    <div className="font-medium">{selectedTravel.hotel}</div>
                  </div>
                )}

                {selectedTravel.notes && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Notes</div>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {selectedTravel.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
