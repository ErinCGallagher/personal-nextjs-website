/**
 * Client Component for travel itinerary display.
 * Handles rendering of travel data in CalendarView.
 */
"use client";

import CalendarView from "@/app/components/travel/calendar-view";

interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  flight: string | null;
  rental_car: string | null;
  notes: string | null;
}

interface TravelClientProps {
  initialTravels: TravelEntry[];
}

export default function TravelClient({ initialTravels }: TravelClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-16">
        <div className="w-full mx-auto px-6 md:px-12 py-12 bg-white text-foreground rounded-lg">
          <h1 className="text-4xl sm:text-5xl font-bold mb-10">
            Sabbatical Travel Itinerary
          </h1>

          {initialTravels.length === 0 ? (
            <p className="text-foreground/60">No travel entries found.</p>
          ) : (
            <CalendarView travels={initialTravels} />
          )}
        </div>
      </div>
    </div>
  );
}
