import type { Role } from "@prisma/client";

/**
 * Definisi peran dan hak akses (RBAC sederhana, 3 peran).
 * Sumber acuan: `docs/PRD YOFALAB Website dan Panel Admin.md` bagian 2.
 *
 * - SUPER_ADMIN: akses penuh (pengguna, pengaturan, seluruh modul).
 * - EDITOR: mengelola produk, kategori, blog, halaman, media; membaca pesan.
 * - CS: hanya membaca dan menandai status pesan kontak.
 */
export const ROLES = ["SUPER_ADMIN", "EDITOR", "CS"] as const;

export type AppRole = Role;

/** Label bahasa Indonesia untuk ditampilkan di UI. */
export const roleLabels: Record<AppRole, string> = {
  SUPER_ADMIN: "Super Admin",
  EDITOR: "Editor",
  CS: "Staf CS",
};

/**
 * Area admin yang dilindungi, dipetakan ke peran yang boleh mengaksesnya.
 * Peran pada daftar berarti diizinkan; di luar daftar berarti 403.
 */
export const ROUTE_ROLES: Record<string, AppRole[]> = {
  "/admin/users": ["SUPER_ADMIN"],
  "/admin/settings": ["SUPER_ADMIN"],
};

/** Semua pengguna yang login boleh membuka area admin dasar. */
export const ADMIN_BASE_ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR", "CS"];

/** Peran yang boleh mengelola konten (produk, blog, halaman, media). */
export const CONTENT_ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR"];

/**
 * Periksa apakah `role` termasuk dalam `allowed`.
 * Mengembalikan false bila role kosong/tidak dikenal (fail-closed).
 */
export function hasRole(
  role: string | null | undefined,
  allowed: readonly AppRole[],
): boolean {
  if (!role) return false;
  return (allowed as readonly string[]).includes(role);
}

/** Periksa apakah role dikenal sebagai peran admin yang valid. */
export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}
