/**
 * Script to create an admin user in the database.
 * Run this once after setting up BetterAuth.
 * Usage: tsx src/create-admin.ts <email> <password> <name>
 */
import "dotenv/config";
import { auth } from "./auth";

async function createAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error("Usage: tsx src/create-admin.ts <email> <password> <name>");
    console.error("Example: tsx src/create-admin.ts admin@example.com mypassword Admin");
    process.exit(1);
  }

  const [email, password, name] = args;

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

    // Update the user's role to admin
    // We need to directly update the database since BetterAuth doesn't have a direct API for this
    const { default: pool } = await import("./db");
    await pool.query(
      'UPDATE "user" SET role = $1 WHERE id = $2',
      ["admin", user.user.id]
    );

    console.log("✓ User role updated to admin");
    console.log("\nAdmin user created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log("\nYou can now log in at /admin");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
