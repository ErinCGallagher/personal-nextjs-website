"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function TravelPage() {
  const [travels, setTravels] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTravelData();
  }, []);

  async function fetchTravelData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(api.admin.travel(), {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch travel data");
      }

      const data = await response.json();
      setTravels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching travel data:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-16">
        <div className="w-full mx-auto px-6 md:px-12 py-12 bg-white text-foreground rounded-lg">
          <h1 className="text-4xl sm:text-5xl font-bold mb-10">
            Sabbatical Travel Itinerary
          </h1>

          {loading && (
            <p className="text-foreground/60">Loading travel data...</p>
          )}

          {error && (
            <div className="text-red-600 mb-4">
              Error loading travel data: {error}
            </div>
          )}

          {!loading && !error && travels.length === 0 && (
            <p className="text-foreground/60">No travel entries found.</p>
          )}

          {!loading && !error && travels.length > 0 && (
            <CalendarView travels={travels} />
          )}
        </div>
      </div>
    </div>
  );
}
