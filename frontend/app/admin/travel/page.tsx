import { api } from "@/app/lib/api";
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

export default async function TravelPage() {
  let travels: TravelEntry[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(api.admin.travel(), {
      cache: "no-store", // Always get fresh data
    });

    if (!response.ok) {
      throw new Error("Failed to fetch travel data");
    }

    travels = await response.json();
  } catch (err) {
    error = err instanceof Error ? err.message : "An error occurred";
    console.error("Error fetching travel data:", err);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-16">
        <div className="w-full mx-auto px-6 md:px-12 py-12 bg-white text-foreground rounded-lg">
          <h1 className="text-4xl sm:text-5xl font-bold mb-10">
            Sabbatical Travel Itinerary
          </h1>

          {error && (
            <div className="text-red-600 mb-4">
              Error loading travel data: {error}
            </div>
          )}

          {!error && travels.length === 0 && (
            <p className="text-foreground/60">No travel entries found.</p>
          )}

          {!error && travels.length > 0 && <CalendarView travels={travels} />}
        </div>
      </div>
    </div>
  );
}
