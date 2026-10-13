"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/site";
import { hasRole, type AppRole } from "@/lib/auth/roles";

/** Apakah item menu cocok dengan pathname saat ini (kecuali /admin persis). */
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar admin: lebar 248 px latar `brand-700`, teks putih, item aktif
 * berlatar putih 12% dengan garis kiri 3 px `brand-300`.
 * Di layar < lg, sidebar menjadi laci yang dibuka lewat tombol di topbar.
 *
 * Status `open` dikendalikan induk (`AdminShell`) karena tombol pembukanya
 * berada di topbar, bukan di dalam sidebar.
 */
export function AdminSidebar({
  role,
  open,
  onOpenChange,
}: {
  role: AppRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  const groups = adminNav
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.roles || hasRole(role, item.roles)),
    }))
    .filter((g) => g.items.length > 0);

  const nav = (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-6 px-3 py-6">
      {groups.map((group) => (
        <div key={group.group}>
          <p className="px-3 pb-2 font-heading text-xs font-semibold uppercase tracking-wide text-white/50">
            {group.group}
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-sm py-2 pl-3 pr-2 font-body text-sm transition-colors ${
                      active
                        ? "bg-white/12 border-l-[3px] border-brand-300 font-semibold text-white"
                        : "border-l-[3px] border-transparent text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span aria-hidden="true" className="text-base">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Sidebar desktop: track gulir sendiri agar tidak ikut naik bersama isi halaman. */}
      <aside
        id="admin-sidebar"
        className="hidden w-[248px] shrink-0 overflow-y-auto overscroll-y-contain bg-brand-700 lg:block"
      >
        {nav}
      </aside>

      {/* Laci mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[248px] overflow-y-auto bg-brand-700">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-3 text-white/80 hover:text-white"
            >
              ✕
            </button>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
