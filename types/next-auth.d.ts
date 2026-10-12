import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Augmentasi tipe Auth.js agar `session.user` dan JWT membawa
 * `id` (string, karena BigInt tidak bisa diserialisasi) dan `role`.
 *
 * Catatan: `next-auth/jwt` hanya me-re-export dari `@auth/core/jwt`, sedangkan
 * tipe `token` pada callback berasal dari `@auth/core/jwt`. Karena itu kedua
 * modul perlu di-augmentasi.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
