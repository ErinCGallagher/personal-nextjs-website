/**
 * Admin travel itinerary page.
 * Displays sabbatical travel schedule.
 */
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth-server";
import TravelClient from "./client";

export default async function TravelPage() {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    redirect("/admin");
  }

  return <TravelClient />;
}
