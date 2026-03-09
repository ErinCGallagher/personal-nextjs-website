/**
 * Admin travel itinerary page.
 * Displays sabbatical travel schedule.
 */
import TravelClient from "./client";

export default function TravelPage() {
  // Client component will fetch data with cookies via credentials: "include"
  // Server-side fetch doesn't work with cross-domain cookies
  return <TravelClient />;
}
