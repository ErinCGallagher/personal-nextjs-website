/**
 * Admin travel itinerary page.
 * Displays sabbatical travel schedule.
 */
import { cookies } from "next/headers";
import { requireAdmin } from "@/app/lib/auth";
import { api } from "@/app/lib/api";
import TravelClient from "./client";

interface TravelEntry {
  date: string;
  country: string;
  city: string;
  hotel: string | null;
  flight: string | null;
  rental_car: string | null;
  notes: string | null;
}

async function getTravelData(): Promise<TravelEntry[]> {
  // Get session cookie to pass to backend
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId");

  // Call backend to get travel data
  const response = await fetch(api.admin.travel(), {
    headers: {
      Cookie: sessionCookie ? `sessionId=${sessionCookie.value}` : "",
    },
    cache: "no-store", // Ensure fresh data
  });

  if (!response.ok) {
    throw new Error("Failed to fetch travel data");
  }

  return response.json();
}

export default async function TravelPage() {
  // Verify auth server-side - throws if not authenticated
  await requireAdmin();

  // Fetch travel data server-side
  const travels = await getTravelData();

  // Render Client Component with data
  return <TravelClient initialTravels={travels} />;
}
