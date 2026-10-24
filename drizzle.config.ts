import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Memuat .env.local dengan urutan yang sama seperti Next.js
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Isi DATABASE_URL_UNPOOLED (atau DATABASE_URL) di .env.local sebelum menjalankan drizzle-kit."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});