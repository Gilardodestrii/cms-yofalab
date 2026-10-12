import type { NextAuthConfig } from "next-auth";
import { isAppRole } from "@/lib/auth/roles";

/**
 * Konfigurasi Auth.js yang **aman untuk Edge Runtime**.
 *
 * Dipakai oleh `middleware.ts` yang berjalan di Edge: hanya membaca/mendekode
 * JWT dari cookie, sehingga dilarang mengimpor Prisma, bcrypt, atau `node:crypto`.
 * Provider Credentials yang menyentuh database ditambahkan di `lib/auth/index.ts`.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  // Provider kosong di level middleware; provider sebenarnya ada di index.ts.
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        if (isAppRole(user.role)) token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;