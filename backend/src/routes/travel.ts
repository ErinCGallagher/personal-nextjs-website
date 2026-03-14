/**
 * Public travel visualization API routes.
 */

import { Router } from "express";
import { readTravelCSV } from "../services/csv-reader";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const travels = await readTravelCSV();
    res.json(travels);
  } catch (error) {
    console.error("Error reading travel data:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to load travel data",
    });
  }
});

export default router;
