import { z } from "zod";

/**
 * Validasi variabel lingkungan dengan Zod.
 * Dipanggil sekali saat modul dimuat; proses gagal cepat bila ada yang salah.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL harus berupa URL koneksi valid"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET minimal 16 karakter"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL harus berupa URL valid"),
  // Direktori penyimpanan berkas unggahan (relatif terhadap root proyek).
  UPLOAD_DIR: z.string().optional().default("uploads"),
  // Batas ukuran unggahan dalam byte (default 5 MB).
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(5 * 1024 * 1024),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  MAIL_FROM: z.string().optional().default(""),
  MAIL_TO: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Variabel lingkungan tidak valid:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Variabel lingkungan tidak valid. Periksa file .env.");
}

export const env = parsed.data;
export type Env = typeof env;
