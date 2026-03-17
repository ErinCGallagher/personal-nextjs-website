/** Pure calendar utility functions and types for travel data. */

export interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  flight: string | null;
  rental_car: string | null;
  notes: string | null;
}

export interface MonthData {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  firstDayOfWeek: number;
  entries: TravelEntry[];
}

/** Groups travel entries by "YYYY-MM" key. */
export function groupTravelsByMonth(
  travels: TravelEntry[]
): Record<string, TravelEntry[]> {
  return travels.reduce(
    (acc, travel) => {
      const date = new Date(travel.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[yearMonth]) {
        acc[yearMonth] = [];
      }
      acc[yearMonth].push(travel);
      return acc;
    },
    {} as Record<string, TravelEntry[]>
  );
}

/** Returns months that have travel data, sorted chronologically. */
export function getAvailableMonths(
  travelsByMonth: Record<string, TravelEntry[]>
): Date[] {
  return Object.keys(travelsByMonth)
    .sort()
    .map((yearMonth) => {
      const [year, month] = yearMonth.split("-").map(Number);
      return new Date(year, month - 1, 1);
    });
}

/** Returns the travel entry for a given date, or null. */
export function getTravelForDate(
  date: Date,
  travels: TravelEntry[]
): TravelEntry | null {
  const dateStr = date.toISOString().split("T")[0];
  return travels.find((t) => t.date === dateStr) || null;
}

/** Detects whether a date is a single stay or the start, middle, or end of a multi-day stay. */
export function getStayPosition(
  date: Date,
  travels: TravelEntry[]
): "single" | "start" | "middle" | "end" {
  const currentTravel = getTravelForDate(date, travels);
  if (!currentTravel) return "single";

  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevTravel = getTravelForDate(prevDate, travels);
  const hasPrev =
    prevTravel?.country === currentTravel.country &&
    prevTravel?.city === currentTravel.city;

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

/** Builds the MonthData object for the given month, or returns null if no data exists. */
export function getMonthData(
  currentMonth: Date,
  travelsByMonth: Record<string, TravelEntry[]>
): MonthData | null {
  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthEntries = travelsByMonth[yearMonth];

  if (!monthEntries) return null;

  const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  return {
    year: currentMonth.getFullYear(),
    month: currentMonth.getMonth(),
    monthName: firstOfMonth.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    }),
    daysInMonth,
    firstDayOfWeek: firstOfMonth.getDay(),
    entries: monthEntries.slice().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  };
}
