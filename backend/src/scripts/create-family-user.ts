/**
 * Script to create the family user with role='family'.
 * Run local: pnpm tsx src/scripts/create-family-user.ts
 * Run Prod:
 *  - railway link
 *  - DATABASE_URL="DB_URL" pnpm tsx src/scripts/create-family-user.ts
 */
import "dotenv/config";
import { auth } from "../auth";

async function createFamilyUser() {
  const email = "family-email@example.com";
  const password = "some-password";
  const name = "Family";

  try {
    // Create user with email and password
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    console.log("✓ User created:", user.user.email);
    console.log("✓ User ID:", user.user.id);

    // Update the user's role to family
    const { default: pool } = await import("../db");
    await pool.query('UPDATE "user" SET role = $1 WHERE id = $2', [
      "family",
      user.user.id,
    ]);

    console.log("✓ User role updated to family");
    console.log("\nFamily user created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(
      "\nThis user can now log in at /admin and will see the travel page",
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating family user:", error);
    process.exit(1);
  }
}

createFamilyUser();
