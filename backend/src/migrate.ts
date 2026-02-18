/**
 * Use this script when a new table or column is added to the DB.
 * It will apply this change to all environments
 *
 * Tracks applied migrations in a `migrations` table to avoid re-running them.
 * Can be run directly as a script via `pnpm migrate`
 *
 * How to Run:
 * - Directly:  pnpm migrate
 * - In tests: test-setup.ts
 * */
import fs from "fs";
import path from "path";
import { Pool } from "pg";

export async function runMigrations(pool: Pool): Promise<void> {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;

    const { rows } = await pool.query(
      "SELECT filename FROM migrations WHERE filename = $1",
      [file],
    );

    if (rows.length > 0) {
      console.log(`Skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
    await pool.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
    console.log(`Applied ${file}`);
  }
}

// Run when executed directly via `pnpm migrate`
if (require.main === module) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  runMigrations(pool)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
