import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

/**
 * Middleware proteksi area admin.
 *
 * Memakai konfigurasi Edge-safe (`authConfig`) tanpa Prisma/bcrypt.
 *
 * - Semua `/admin/*` selain halaman login/forbidden wajib login.
 * - Pengguna yang belum login diarahkan ke `/admin/login` dengan `callbackUrl`.
 * - Pengguna yang sudah login tapi membuka `/admin/login` diarahkan ke dashboard.
 * - Otorisasi per-peran (mis. /admin/users) ditegakkan di layout server, karena
 *   RBAC detail lebih aman diperiksa di server dengan data sesi terbaru.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth?.user);
  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/forbidden";

  if (!isLoggedIn && !isAuthPage) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Jalankan hanya untuk rute admin.
  matcher: ["/admin/:path*"],
};
