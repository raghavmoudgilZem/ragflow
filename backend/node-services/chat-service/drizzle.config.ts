import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL_CHAT;

if (!dbUrl) {
  throw new Error(
    "CRITICAL: Database connection URL is missing from environment variables.",
  );
}

export default defineConfig({
  schema: "./src/core/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
