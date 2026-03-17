/**
 * Calendar view component for travel visualization.
 * Displays travel entries in a month-by-month calendar format.
 */

"use client";

import { useState, useEffect } from "react";
import { getCountryColor, getCountryFlag } from "@/app/lib/color-utils";
import DayDetailModal from "./day-detail-modal";
import {
  groupTravelsByMonth,
  getAvailableMonths,
  getTravelForDate,
  getStayPosition,
  getMonthData,
} from "./calendar-utils";
import type { TravelEntry } from "./calendar-utils";

interface CalendarViewProps {
  travels: TravelEntry[];
}

export default function CalendarView({ travels }: CalendarViewProps) {
  const [selectedTravel, setSelectedTravel] = useState<TravelEntry | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const travelsByMonth = groupTravelsByMonth(travels);
  const availableMonths = getAvailableMonths(travelsByMonth);

  // Set default to closest month with data if current month has none
  useEffect(() => {
    if (availableMonths.length > 0) {
      const currentYearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
      const hasCurrentMonthData = travelsByMonth[currentYearMonth];

      if (!hasCurrentMonthData) {
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

  const monthData = getMonthData(currentMonth, travelsByMonth);

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  if (!monthData) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/60">
          No travel data for{" "}
          {currentMonth.toLocaleDateString("en-US", { year: "numeric", month: "long" })}
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center space-x-4">
          <h3 className="text-xl sm:text-2xl font-bold">{monthData.monthName}</h3>
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
              onClick={() => setCurrentMonth(month)}
              className={`px-4 py-2 text-sm sm:text-base font-medium rounded-full transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {month.toLocaleDateString("en-US", { month: "long" })}
            </button>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="hidden sm:grid grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
            (day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-700 py-3 text-sm sm:text-base"
              >
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Empty cells before the first day (hidden on mobile) */}
          {Array.from({ length: monthData.firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="hidden sm:block min-h-[100px] bg-gray-50 rounded" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: monthData.daysInMonth }, (_, day) => {
            const dayNumber = day + 1;
            const dayDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              dayNumber
            );
            const travel = getTravelForDate(dayDate, monthData.entries);
            const stayPos = getStayPosition(dayDate, monthData.entries);
            const today = new Date();
            const isToday =
              dayDate.getDate() === today.getDate() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getFullYear() === today.getFullYear();

            let cellClassName = `min-h-[120px] sm:min-h-[140px] p-2 sm:p-3 relative transition-all duration-200 border border-gray-300 ${
              travel ? "cursor-pointer hover:scale-105 hover:shadow-lg hover:z-10" : ""
            }`;

            if (travel) {
              if (stayPos === "single") cellClassName += " rounded";
              else if (stayPos === "start") cellClassName += " rounded-l";
              else if (stayPos === "end") cellClassName += " rounded-r";
            } else {
              cellClassName += " rounded";
            }

            if (isToday && !travel) {
              cellClassName += " border-blue-500 ring-2 ring-blue-200";
            }

            return (
              <div
                key={dayNumber}
                className={cellClassName}
                style={{ backgroundColor: travel ? getCountryColor(travel.country) : undefined }}
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
                    <div className="text-gray-700 mt-1 flex gap-1.5">
                      {travel.flight && <span className="text-2xl sm:text-3xl">✈️</span>}
                      {travel.rental_car && <span className="text-2xl sm:text-3xl">🚗</span>}
                      {travel.notes && <span className="text-2xl sm:text-3xl">📝</span>}
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

      {selectedTravel && (
        <DayDetailModal
          travel={selectedTravel}
          onClose={() => setSelectedTravel(null)}
        />
      )}
    </div>
  );
}
