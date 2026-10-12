import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient.
 * Pada development, instance disimpan di globalThis agar tidak membuat
 * koneksi baru setiap hot-reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
