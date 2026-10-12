import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { authConfig } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request";
import { recordActivity } from "@/lib/activity";

/** Skema kredensial login; divalidasi di server sebelum menyentuh database. */
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

/** Batas percobaan login: 5 kali per 15 menit per IP. */
export const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

/**
 * Konfigurasi Auth.js v5 lengkap (Credentials + JWT di cookie httpOnly).
 * Memakai `authConfig` sebagai basis (aman untuk Edge), lalu menambahkan
 * provider Credentials yang mengakses database — hanya berjalan di Node.
 *
 * Mengembalikan instance `handlers`, `auth`, `signIn`, `signOut`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = getClientIp(request.headers);
        const ipHash = hashIp(ip, env.AUTH_SECRET);
        const rateKey = `login:${ipHash ?? email}`;

        // Rate limit sebelum menyentuh database.
        const rate = checkRateLimit({ key: rateKey, ...LOGIN_RATE_LIMIT });
        if (!rate.allowed) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        // Login sukses: bersihkan penghitung dan catat aktivitas + waktu login.
        resetRateLimit(rateKey);
        const id = user.id.toString();
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        await recordActivity({
          userId: user.id,
          action: "login",
          entity: "user",
          entityId: user.id,
          ip,
        });

        return {
          id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
