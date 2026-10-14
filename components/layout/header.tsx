"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/site";

/**
 * Header publik: tinggi 110 px, latar putih, garis bawah 1 px.
 * Menu aktif berwarna brand-500 dengan garis bawah 2 px.
 * Di mobile menjadi panel geser dengan ikon burger.
 * Bila `logoPath` terisi (diatur di Pengaturan → Logo Situs), tampil logo;
 * bila kosong, fallback tulisan YOFALAB.
 */
export function Header({ siteName, logoPath }: { siteName: string; logoPath?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="container-site flex h-[110px] items-center justify-between">
        <Link
          href="/"
          className="flex items-center font-heading text-xl font-bold text-brand-600"
          aria-label={`${siteName} - Home`}
        >
          {logoPath ? (
            <Image
              src={logoPath}
              alt="Logo YOFALAB"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          ) : (
            "YOFALAB"
          )}
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigasi utama"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "border-b-2 py-2 font-body text-[15px] font-medium transition-colors duration-150 ease-out hover:text-brand-600 " +
                (isActive(item.href)
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-ink-600")
              }
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-ink-900 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="text-2xl">
            {open ? "\u2715" : "\u2630"}
          </span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-line bg-surface md:hidden"
          aria-label="Navigasi seluler"
        >
          <ul className="container-site flex flex-col py-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    "block py-3 font-body text-base font-medium " +
                    (isActive(item.href)
                      ? "text-brand-600"
                      : "text-ink-600")
                  }
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
