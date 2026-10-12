import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * Footer publik: latar brand-600, teks terang, tautan memakai brand-link.
 * Data kontak masih statis; akan diambil dari `site_settings` pada sprint 7.
 */
export function Footer() {
  return (
    <footer className="bg-brand-600 text-white">
      <div className="container-site grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold">YOFALAB</p>
          <p className="mt-3 font-body text-sm leading-relaxed text-brand-link">
            Jl. Amarta No.12 A RT01, RW.01, Pelem, Baturetno, Banguntapan,
            Bantul Regency, Special Region of Yogyakarta 55198
          </p>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide">
            Navigasi
          </p>
          <ul className="mt-3 space-y-2 font-body text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-brand-link transition-colors duration-150 ease-out hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide">
            Hubungi Kami
          </p>
          <ul className="mt-3 space-y-2 font-body text-sm text-brand-link">
            <li>
              <a href="tel:02744436047" className="hover:text-white">
                (0274) 4436047
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/62811255450"
                className="hover:text-white"
              >
                +62 811-255-450
              </a>
            </li>
            <li>
              <a href="mailto:info@yofalab.com" className="hover:text-white">
                info@yofalab.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 py-5">
        <p className="container-site text-center font-body text-xs text-brand-link">
          Copyright &copy; 2026 YOFALAB Indonesia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
