import path from "node:path";
import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma config menonaktifkan pemuatan .env otomatis, jadi kita muat manual.
loadEnv();

/**
 * Konfigurasi Prisma (menggantikan properti `prisma` di package.json yang
 * akan dihapus pada Prisma 7). Menunjuk skema dan perintah seed.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
