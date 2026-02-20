/**
 * Script to generate bcrypt hash for admin password.
 * Usage: tsx src/scripts/hash-password.ts YOUR_PASSWORD
 */
import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  console.error("Usage: tsx src/scripts/hash-password.ts YOUR_PASSWORD");
  process.exit(1);
}

async function hashPassword() {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("\nPassword hash:");
  console.log(hash);
  console.log("\nAdd this to your .env file as:");
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
}

hashPassword();
