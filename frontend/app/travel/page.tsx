import { api } from "@/app/lib/api";
import CalendarView from "@/components/travel/CalendarView";

interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  notes: string | null;
}

export default async function TravelPage() {
  let travels: TravelEntry[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(api.travel(), {
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
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 bg-white text-foreground rounded-lg">
          <h1 className="text-3xl font-bold mb-8">
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

          {!error && travels.length > 0 && (
            <>
              {/* Calendar View */}
              <div className="mb-12">
                <CalendarView travels={travels} />
              </div>

              {/* List View */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Travel Timeline</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {travels.map((travel, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="text-sm text-grey-blue mb-1">
                        {new Date(travel.date).toLocaleDateString("en-CA", {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-lg font-semibold text-foreground mb-2">
                        {travel.city}, {travel.country}
                      </div>
                      {travel.hotel && (
                        <div className="text-sm text-dark-grey mb-2">
                          {travel.hotel}
                        </div>
                      )}
                      {travel.notes && (
                        <div className="text-sm text-foreground/80">
                          {travel.notes.length > 100
                            ? `${travel.notes.substring(0, 100)}...`
                            : travel.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
