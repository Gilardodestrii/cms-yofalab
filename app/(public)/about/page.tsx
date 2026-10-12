import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Profil YOFALAB Indonesia: visi, misi, dan riset pengembangan di bidang alat kesehatan.",
};

/** Halaman About Us (placeholder Sprint 1). Konten dinamis menyusul di Sprint 6-7. */
export default function AboutPage() {
  return (
    <section className="container-site py-16 md:py-24">
      <p className="label-caps">About Us</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Tentang YOFALAB</h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        Profil, Vision, Mission, dan R&amp;D akan tampil di sini. Konten akan
        dikelola dari panel admin pada Sprint 7.
      </p>
    </section>
  );
}
