import type { Metadata } from "next";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { ContactForm } from "@/components/ui/contact-form";
import { getContactSetting, whatsappLink } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Hubungi YOFALAB Indonesia: alamat, telepon, WhatsApp, dan email untuk informasi produk dan kerja sama.",
  alternates: { canonical: "/contact" },
};

/** ISR 5 menit: info kontak dari `site_settings.contact`. */
export const revalidate = 300;

/** Halaman Contact Us: info kontak dari `site_settings.contact` + formulir. */
export default async function ContactPage() {
  const [info, locale] = await Promise.all([getContactSetting(), getLocale()]);

  const waNumber = whatsappLink(info.whatsapp);
  const rows: { label: string; value?: string; href?: string }[] = [
    { label: t("contact", "address", locale), value: info.address },
    { label: t("contact", "phone", locale), value: info.phone, href: info.phone ? `tel:${info.phone.replace(/[^0-9+]/g, "")}` : undefined },
    { label: t("contact", "whatsapp", locale), value: info.whatsapp, href: waNumber || undefined },
    { label: t("contact", "email", locale), value: info.email, href: info.email ? `mailto:${info.email}` : undefined },
  ];

  return (
    <div>
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {t("contact", "title", locale)}
          </h1>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb
              items={[
                { label: t("common", "home", locale), href: "/" },
                { label: t("contact", "breadcrumb", locale) },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-site grid gap-10 py-10 md:grid-cols-2 md:py-14">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink-900">
            {t("contact", "title", locale)}
          </h2>
          <p className="mt-3 max-w-reading font-body text-base text-ink-600">
            {t("contact", "subtitle", locale)}
          </p>
          <ul className="mt-6 flex flex-col gap-4">
            {rows.map((r) => (
              <li key={r.label}>
                <p className="label-caps">{r.label}</p>
                {r.value ? (
                  r.href ? (
                    <a
                      href={r.href}
                      {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="font-body text-base text-ink-600 hover:text-brand-600"
                    >
                      {r.value}
                    </a>
                  ) : (
                    <p className="font-body text-base text-ink-600">{r.value}</p>
                  )
                ) : (
                  <p className="font-body text-base text-ink-400">{t("contact", "notFilled", locale)}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-line bg-surface p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-ink-900">
            {t("contact", "sendMessage", locale)}
          </h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
