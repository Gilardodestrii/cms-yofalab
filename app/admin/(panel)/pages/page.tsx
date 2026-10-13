import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { getAboutPageContent, getHomePageContent } from "@/lib/pages";
import { AboutPageForm, HomePageForm } from "./page-forms";

export const metadata: Metadata = {
  title: "Halaman",
  robots: { index: false, follow: false },
};

/** Editor halaman dinamis (`/admin/pages`): blok Home + About Us. */
export default async function AdminPagesPage() {
  await requireRole(CONTENT_ROLES, "/admin/pages");

  const [home, about] = await Promise.all([getHomePageContent(), getAboutPageContent()]);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Halaman" }]} />
      <div>
        <h1 className="font-heading text-lg font-semibold text-ink-900">Halaman</h1>
        <p className="mt-1 font-body text-sm text-ink-600">
          Konten Home dan About Us yang tampil di situs publik.
        </p>
      </div>
      <HomePageForm
        initial={{
          heroTitle: home.heroTitle,
          heroSubtitle: home.heroSubtitle,
          stats: home.stats,
          getToKnowTitle: home.getToKnowTitle,
          getToKnowBody: home.getToKnowBody,
          getToKnowImagePath: home.getToKnowImagePath,
          advantages: home.advantages,
        }}
      />
      <AboutPageForm
        initial={{
          profile: about.profile,
          vision: about.vision,
          mission: about.mission,
          rnd: about.rnd,
        }}
      />
    </div>
  );
}
