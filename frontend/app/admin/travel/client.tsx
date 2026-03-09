/**
 * Client Component for travel itinerary display.
 * Handles rendering of travel data in CalendarView.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CalendarView from "@/app/components/travel/calendar-view";
import { api } from "@/app/lib/api";
import { authClient } from "@/app/lib/auth-client";

interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  flight: string | null;
  rental_car: string | null;
  notes: string | null;
}

export default function TravelClient() {
  const [travels, setTravels] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchTravelData();
  }, []);

  async function fetchTravelData() {
    setLoading(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const travelUrl = backendUrl ? `${backendUrl}/api/admin/travel` : api.admin.travel();

      const response = await fetch(travelUrl, {
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
      setError("Failed to load travel data");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-foreground/60">Loading travel data...</div>
          ) : travels.length === 0 ? (
            <p className="text-foreground/60">No travel entries found.</p>
          ) : (
            <CalendarView travels={travels} />
          )}
        </div>
      </div>
    </div>
  );
}
