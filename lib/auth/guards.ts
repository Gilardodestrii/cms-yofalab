import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasRole, type AppRole } from "@/lib/auth/roles";

export type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
};

/**
 * Ambil pengguna yang sedang login, atau null.
 * Gunakan di Server Component / Server Action / Route Handler.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  };
}

/**
 * Wajib login. Bila belum, arahkan ke halaman login sambil menyimpan
 * `callbackUrl` untuk kembali ke halaman tujuan.
 */
export async function requireUser(
  callbackUrl = "/admin",
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

/**
 * Wajib memiliki salah satu peran `allowed`.
 * - Belum login  -> redirect ke /admin/login.
 * - Tidak berhak -> redirect ke /admin/forbidden (403).
 *
 * Ini kontrol akses sisi server: jangan hanya mengandalkan penyembunyian UI.
 */
export async function requireRole(
  allowed: readonly AppRole[],
  callbackUrl = "/admin",
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (!hasRole(user.role, allowed)) {
    redirect("/admin/forbidden");
  }
  return user;
}
