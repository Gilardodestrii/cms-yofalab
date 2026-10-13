import type { Metadata } from "next";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { ContactForm } from "@/components/ui/contact-form";
import { getContactSetting, whatsappLink } from "@/lib/settings";

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
  const info = await getContactSetting();

  const waNumber = whatsappLink(info.whatsapp);
  const rows: { label: string; value?: string; href?: string }[] = [
    { label: "Alamat", value: info.address },
    { label: "Telepon", value: info.phone, href: info.phone ? `tel:${info.phone.replace(/[^0-9+]/g, "")}` : undefined },
    { label: "WhatsApp", value: info.whatsapp, href: waNumber || undefined },
    { label: "Email", value: info.email, href: info.email ? `mailto:${info.email}` : undefined },
  ];

  return (
    <div>
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">Contact Us</h1>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
          </div>
        </div>
      </section>

      <section className="container-site grid gap-10 py-10 md:grid-cols-2 md:py-14">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink-900">Hubungi Kami</h2>
          <p className="mt-3 max-w-reading font-body text-base text-ink-600">
            Kirim pertanyaan tentang produk, permintaan penawaran, atau kerja sama distribusi.
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
                  <p className="font-body text-base text-ink-400">Belum diisi.</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-line bg-surface p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-ink-900">Kirim Pesan</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
