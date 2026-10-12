import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artikel dan informasi seputar alat kesehatan, reagen laboratorium, serta kesehatan dari YOFALAB Indonesia.",
};

/** Halaman daftar blog (placeholder Sprint 1). Daftar + pencarian menyusul di Sprint 6. */
export default function BlogPage() {
  return (
    <section className="container-site py-16 md:py-24">
      <p className="label-caps">Blog</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Artikel</h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        Daftar artikel akan tampil di sini. Konten dan pencarian blog dibangun
        pada Sprint 6.
      </p>
    </section>
  );
}
