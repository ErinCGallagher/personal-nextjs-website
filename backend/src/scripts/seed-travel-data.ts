/**
 * Script to populate the travel_itinerary table from CSV file.
 * Run local: pnpm tsx src/scripts/seed-travel-data.ts
 * Run Prod: 
 *  - railway link
 * - DATABASE_URL="DB_URL" pnpm tsx src/scripts/seed-travel-data.ts
 */
import "dotenv/config";
import pool from "../db";
import { readTravelCSV } from "../services/csv-reader";

async function seedTravelData() {
  try {
    console.log("Reading travel data from CSV...");
    const entries = await readTravelCSV();
    console.log(`Found ${entries.length} travel entries`);

    // Clear existing data
    await pool.query("DELETE FROM travel_itinerary");
    console.log("Cleared existing travel data");

    // Insert new data
    for (const entry of entries) {
      await pool.query(
        `INSERT INTO travel_itinerary (date, country, city, hotel, flight, rental_car, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          entry.date,
          entry.country,
          entry.city,
          entry.hotel,
          entry.flight,
          entry.rental_car,
          entry.notes,
        ],
      );
    }

    console.log(`Successfully seeded ${entries.length} travel entries`);
  } catch (error) {
    console.error("Error seeding travel data:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedTravelData();
