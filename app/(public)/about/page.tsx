import type { Metadata } from "next";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { getAboutPageContent } from "@/lib/pages";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Profil YOFALAB Indonesia: visi, misi, dan riset pengembangan di bidang alat kesehatan.",
  alternates: { canonical: "/about" },
};

/** ISR 5 menit: konten About dari `pages.ABOUT`. */
export const revalidate = 300;

/** Halaman About Us: profil, Vision, Mission, R&D dari `pages.ABOUT`. */
export default async function AboutPage() {
  const [content, locale] = await Promise.all([getAboutPageContent(), getLocale()]);
  const missions = content.mission;

  const blocks: { title: string; body?: string; list?: string[] }[] = [
    { title: t("about", "vision", locale), body: content.vision },
    { title: t("about", "mission", locale), list: missions },
    { title: t("about", "rnd", locale), body: content.rnd },
  ];

  return (
    <div>
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {t("about", "title", locale)}
          </h1>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb
              items={[
                { label: t("common", "home", locale), href: "/" },
                { label: t("about", "breadcrumb", locale) },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        <h2 className="font-heading text-2xl font-semibold text-ink-900">
          {t("about", "sectionTitle", locale)}
        </h2>
        <p className="mt-4 max-w-reading whitespace-pre-line font-body text-base text-ink-600">
          {content.profile || t("about", "noProfile", locale)}
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {blocks.map((b) => (
            <div key={b.title} className="rounded-sm border border-line bg-surface p-6">
              <h3 className="font-heading text-lg font-semibold text-brand-700">{b.title}</h3>
              {b.body && (
                <p className="mt-3 whitespace-pre-line font-body text-sm text-ink-600">{b.body}</p>
              )}
              {b.list && b.list.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {b.list.map((item, i) => (
                    <li key={i} className="flex gap-2 font-body text-sm text-ink-600">
                      <span aria-hidden="true" className="text-brand-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {!b.body && (!b.list || b.list.length === 0) && (
                <p className="mt-3 font-body text-sm text-ink-400">
                  {t("about", "notFilled", locale)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
