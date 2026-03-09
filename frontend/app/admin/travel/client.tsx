/**
 * Client Component for travel itinerary display.
 * Handles rendering of travel data in CalendarView.
 */
"use client";

import { useRouter } from "next/navigation";
import CalendarView from "@/app/components/travel/calendar-view";
import { api } from "@/app/lib/api";

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
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(api.admin.logout(), {
        method: "POST",
        credentials: "include",
      });
      router.push("/admin");
    } catch (err) {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-16">
        <div className="w-full mx-auto px-6 md:px-12 py-12 bg-white text-foreground rounded-lg">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold">
              Sabbatical Travel Itinerary
            </h1>
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>

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
