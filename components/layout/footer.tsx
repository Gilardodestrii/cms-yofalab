import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { getContactSetting, getFooterSetting, getSiteSetting, whatsappLink } from "@/lib/settings";

/**
 * Footer publik: latar brand-600, teks terang, tautan memakai brand-link.
 * Data kontak dan copyright diambil dari `site_settings` (dapat diedit admin).
 * Bila logo putih terisi (Pengaturan → Logo Situs), tampil logo; bila kosong,
 * fallback tulisan YOFALAB.
 */
export async function Footer() {
  const [contact, footer, site] = await Promise.all([
    getContactSetting(),
    getFooterSetting(),
    getSiteSetting(),
  ]);

  const socials = [
    { label: "Facebook", href: footer.facebook },
    { label: "Instagram", href: footer.instagram },
    { label: "LinkedIn", href: footer.linkedin },
    { label: "YouTube", href: footer.youtube },
  ].filter((s) => s.href.trim());

  const wa = whatsappLink(contact.whatsapp);

  return (
    <footer className="bg-brand-600 text-white">
      <div className="container-site grid gap-8 py-12 md:grid-cols-3">
        <div>
          {site.logoWhitePath ? (
            <Image
              src={site.logoWhitePath}
              alt="Logo YOFALAB"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          ) : (
            <p className="font-heading text-lg font-bold">YOFALAB</p>
          )}
          <p className="mt-3 font-body text-sm leading-relaxed text-brand-link">
            {footer.description || contact.address}
          </p>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 font-body text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-link transition-colors duration-150 ease-out hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide">Navigasi</p>
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
          <p className="font-heading text-sm font-semibold uppercase tracking-wide">Hubungi Kami</p>
          <ul className="mt-3 space-y-2 font-body text-sm text-brand-link">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <a href={wa || "#"} className="hover:text-white">
                  {contact.whatsapp}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            )}
            {!contact.phone && !contact.whatsapp && !contact.email && (
              <li className="text-white/70">Info kontak belum diisi.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 py-5">
        <p className="container-site text-center font-body text-xs text-brand-link">
          {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
