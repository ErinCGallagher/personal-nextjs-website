/**
 * Calendar view component for travel visualization.
 * Displays travel entries in a month-by-month calendar format.
 */

"use client";

import { useState, useEffect } from "react";
import {
  getCountryColor,
  getCountryBorderColor,
  getCountryFlag,
} from "@/app/lib/color-utils";
import { FaTimes, FaHotel } from "react-icons/fa";

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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedTravel) {
        setSelectedTravel(null);
      }
    };

    if (selectedTravel) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [selectedTravel]);

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

  // Helper function to detect stay position for multi-day styling
  function getStayPosition(
    date: Date,
    travels: TravelEntry[],
  ): "single" | "start" | "middle" | "end" {
    const currentTravel = getTravelForDate(date, travels);
    if (!currentTravel) return "single";

    // Check previous day
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevTravel = getTravelForDate(prevDate, travels);
    const hasPrev =
      prevTravel?.country === currentTravel.country &&
      prevTravel?.city === currentTravel.city;

    // Check next day
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextTravel = getTravelForDate(nextDate, travels);
    const hasNext =
      nextTravel?.country === currentTravel.country &&
      nextTravel?.city === currentTravel.city;

    if (!hasPrev && !hasNext) return "single";
    if (!hasPrev && hasNext) return "start";
    if (hasPrev && hasNext) return "middle";
    return "end";
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
          className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-6 h-6"
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
          <h3 className="text-xl sm:text-2xl font-bold">
            {monthData.monthName}
          </h3>
          <span className="text-sm sm:text-base text-foreground/60 font-medium">
            {monthData.entries.length} travel{" "}
            {monthData.entries.length === 1 ? "day" : "days"}
          </span>
        </div>

        <button
          onClick={() => navigateMonth("next")}
          className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-6 h-6"
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
              className={`px-4 py-2 text-sm sm:text-base font-medium rounded-full transition-colors ${
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
              className="text-center font-semibold text-gray-700 py-3 text-sm sm:text-base"
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
            const stayPos = getStayPosition(dayDate, monthData.entries);
            const borderColor = travel
              ? getCountryBorderColor(travel.country)
              : undefined;
            const today = new Date();
            const isToday =
              dayDate.getDate() === today.getDate() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getFullYear() === today.getFullYear();

            // Build className based on stay position
            let cellClassName = `min-h-[120px] sm:min-h-[140px] p-2 sm:p-3 relative transition-opacity ${
              travel ? "cursor-pointer hover:opacity-90" : ""
            }`;

            if (travel) {
              if (stayPos === "single") {
                cellClassName += " border-2 rounded";
              } else if (stayPos === "start") {
                cellClassName += " border-l-4 border-t-2 border-b-2 rounded-l";
              } else if (stayPos === "middle") {
                cellClassName += " border-l-4 border-t-2 border-b-2";
              } else if (stayPos === "end") {
                cellClassName += " border-l-4 border-t-2 border-b-2 border-r-2 rounded-r";
              }
            } else {
              cellClassName += " border border-gray-200 rounded";
            }

            if (isToday && !travel) {
              cellClassName += " border-blue-500 ring-2 ring-blue-200";
            }

            return (
              <div
                key={dayNumber}
                className={cellClassName}
                style={{
                  backgroundColor: travel
                    ? getCountryColor(travel.country)
                    : undefined,
                  borderColor: travel ? borderColor : undefined,
                  borderLeftColor: travel && stayPos !== "single" ? borderColor : undefined,
                  borderTopColor: travel && stayPos !== "single" ? borderColor : undefined,
                  borderBottomColor: travel && stayPos !== "single" ? borderColor : undefined,
                  borderRightColor: travel && stayPos === "end" ? borderColor : undefined,
                }}
                onClick={() => travel && setSelectedTravel(travel)}
              >
                {travel ? (
                  <div className="text-gray-900 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <div className="font-semibold text-sm sm:text-base text-gray-600">
                        {dayNumber}
                        <span className="sm:hidden text-gray-500 ml-1 font-normal text-xs">
                          ({dayDate.toLocaleDateString("en-US", { weekday: "short" })})
                        </span>
                      </div>
                      <div className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                        <span className="text-lg sm:text-xl">{getCountryFlag(travel.country)}</span>
                        <span>{travel.country}</span>
                      </div>
                    </div>
                    <div className="text-gray-800 text-xs sm:text-sm font-medium">{travel.city}</div>
                    <div className="text-gray-700 mt-1 text-base sm:text-lg flex gap-1.5">
                      {travel.flight && <span>✈️</span>}
                      {travel.rental_car && <span>🚗</span>}
                      {travel.notes && <span>📝</span>}
                    </div>
                  </div>
                ) : (
                  <div className="font-semibold text-sm sm:text-base mb-2 text-gray-600">
                    {dayNumber}
                    <span className="sm:hidden text-gray-500 ml-1 font-normal text-xs">
                      ({dayDate.toLocaleDateString("en-US", { weekday: "short" })})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedTravel && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTravel(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-8 sm:p-10 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTravel(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Close modal"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-base sm:text-lg text-grey-blue mb-3">
              {new Date(selectedTravel.date).toLocaleDateString("en-CA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{getCountryFlag(selectedTravel.country)}</span>
              <span>{selectedTravel.country}</span>
            </h2>
            <h3 className="text-xl sm:text-2xl text-grey-blue mb-6 font-semibold">
              {selectedTravel.city}
            </h3>

            <div className="space-y-5">
              {selectedTravel.hotel && (
                <div className="flex items-start gap-3">
                  <FaHotel className="text-grey-blue text-xl mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-grey-blue mb-1">Hotel</div>
                    <div className="text-xl font-medium">{selectedTravel.hotel}</div>
                  </div>
                </div>
              )}

              {selectedTravel.flight && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✈️</span>
                  <div>
                    <div className="text-sm font-semibold text-grey-blue mb-1">Flight</div>
                    <div className="text-lg">{selectedTravel.flight}</div>
                  </div>
                </div>
              )}

              {selectedTravel.rental_car && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <div className="text-sm font-semibold text-grey-blue mb-1">Rental Car</div>
                    <div className="text-lg">{selectedTravel.rental_car}</div>
                  </div>
                </div>
              )}

              {selectedTravel.notes && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="text-sm font-semibold text-grey-blue mb-1">Notes</div>
                    <div className="text-base leading-relaxed whitespace-pre-wrap">
                      {selectedTravel.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
