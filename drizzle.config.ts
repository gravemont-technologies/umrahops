import { defineConfig } from "drizzle-kit";

const isPostgres = !!process.env.DATABASE_URL;

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.SQLITE_PATH || "data/umrahops.db",
  },
});
