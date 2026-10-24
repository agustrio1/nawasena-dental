// Catatan: sengaja TIDAK memakai `import "server-only"` di sini agar file ini
// bisa diimpor oleh skrip seed yang dijalankan lewat Bun CLI (server-only akan
// melempar error di runtime non-bundler). Perlindungan agar DB tidak diimpor
// dari Client Component tetap ditegakkan di src/lib/content.ts (punya
// server-only) dan src/lib/actions/*.ts.
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diatur di environment server.");
}

// Menjaga satu pool saat hot reload di mode development
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool = globalForDb.pgPool ?? new Pool({ connectionString, max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

// Menutup koneksi idle sebelum fungsi Vercel ditangguhkan
if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

export const db = drizzle({ client: pool, schema });