"use client";

import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { roleLabels } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/guards";

/**
 * Topbar admin: tinggi 64 px, latar putih, garis bawah 1 px.
 * Menampilkan tombol menu (mobile), breadcrumb, dan menu akun (avatar).
 *
 * Tombol keluar teks diganti avatar + dropdown karena di layar sempit tombol
 * "Keluar" memakan ruang breadcrumb dan rawan salah tekan. Dropdown memuat
 * identitas pengguna (nama, email, peran) sekaligus aksi keluar.
 *
 * `sticky top-0`: header tetap menempel di atas saat halaman digulir, dan
 * tombol menu berada DI DALAM header sehingga keduanya bergerak menyatu.
 */
export function AdminTopbar({
  user,
  breadcrumb,
  onOpenMenu,
}: {
  user: SessionUser;
  breadcrumb?: React.ReactNode;
  onOpenMenu?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar atau tekan Escape.
  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const displayName = user.name ?? user.email ?? "Pengguna";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu"
          aria-controls="admin-sidebar"
          className="btn-admin-secondary shrink-0 lg:hidden"
        >
          ☰
        </button>
        <div className="min-w-0">{breadcrumb}</div>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Menu akun"
          className="flex items-center gap-2 rounded-sm px-1 py-1 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-heading text-sm font-semibold text-white"
          >
            {initials}
          </span>
          <span className="hidden text-right sm:block">
            <span className="block max-w-[160px] truncate font-heading text-sm font-semibold text-ink-900">
              {displayName}
            </span>
            <span className="block font-body text-xs text-ink-400">
              {roleLabels[user.role]}
            </span>
          </span>
          <span aria-hidden="true" className="hidden text-xs text-ink-400 sm:block">
            ▾
          </span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Akun"
            className="panel-card absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="truncate font-heading text-sm font-semibold text-ink-900">
                {displayName}
              </p>
              <p className="truncate font-body text-xs text-ink-400">
                {user.email}
              </p>
              <p className="mt-1 font-body text-xs text-ink-400">
                {roleLabels[user.role]}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-3 text-left font-heading text-sm font-semibold text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger"
              >
                <span aria-hidden="true">⎋</span>
                Keluar
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
