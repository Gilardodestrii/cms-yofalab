import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Artikel",
  description:
    "Artikel seputar alat kesehatan, reagen laboratorium, serta kesehatan dari YOFALAB Indonesia.",
};

/** Halaman detail blog (placeholder Sprint 1). Konten + komentar menyusul di Sprint 6. */
export default function BlogDetailPage() {
  return (
    <section className="container-site py-16 md:py-24">
      <p className="label-caps">Blog Detail</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Detail Artikel</h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        Isi artikel, info penulis, artikel terkait, dan formulir komentar akan
        tampil di sini. Konten dibangun pada Sprint 6.
      </p>
    </section>
  );
}
