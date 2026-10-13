import type { Metadata } from "next";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { getAboutPageContent } from "@/lib/pages";

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
  const content = await getAboutPageContent();
  const missions = content.mission;

  const blocks: { title: string; body?: string; list?: string[] }[] = [
    { title: "Vision", body: content.vision },
    { title: "Mission", list: missions },
    { title: "Research & Development", body: content.rnd },
  ];

  return (
    <div>
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">About Us</h1>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        <h2 className="font-heading text-2xl font-semibold text-ink-900">Tentang YOFALAB</h2>
        <p className="mt-4 max-w-reading whitespace-pre-line font-body text-base text-ink-600">
          {content.profile ||
            "Profil perusahaan belum diisi. Konten About Us dikelola dari panel admin (/admin/pages)."}
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
                <p className="mt-3 font-body text-sm text-ink-400">Belum diisi.</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
