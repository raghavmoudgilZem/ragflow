import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";
import { logger } from "../services/logger.service";

dotenv.config();

// Singleton Pattern: Prevent multiple pools during nodemon reloads
const globalForDb = global as unknown as { conn: Pool | undefined };

logger.info("[DB] Establishing DB connection pool.");
export const pool =
  globalForDb.conn ??
  new Pool({
    connectionString: process.env.DATABASE_URL_CHAT,
    max: 20, // Max concurrent connections
    idleTimeoutMillis: 30000,
  });

// 1. Pool Event Listeners (Triggers whenever a new client connects/errors)
pool.on("connect", () => {
  logger.info("[DB] New client connected to the connection pool.");
});

pool.on("error", (err) => {
  logger.error("[DB] Unexpected error on idle client", err);
  process.exit(-1);
});

// 2. Startup Health Check (Forces an immediate connection to verify reachability)
pool
  .query("SELECT 1")
  .then(() => logger.info("[DB] Database connection successfully established."))
  .catch((err) =>
    logger.error("[DB] Failed to connect to the database on startup:", err),
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = pool;
}

// Initialize Drizzle with the schema for full type-safety
export const db = drizzle(pool, { schema });

// Export the strongly-typed database instance definition
export type DrizzleDB = NodePgDatabase<typeof schema>;
