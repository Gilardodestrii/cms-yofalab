import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Produk",
  description:
    "Detail produk alat kesehatan YOFALAB Indonesia: spesifikasi, galeri, dan brosur.",
};

/** Halaman detail produk (placeholder Sprint 1). Galeri + tab menyusul di Sprint 4. */
export default function ProductDetailPage() {
  return (
    <section className="container-site py-16 md:py-24">
      <p className="label-caps">Product Detail</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Detail Produk</h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        Galeri gambar, deskripsi, tab spesifikasi, dan tombol unduh brosur
        akan tampil di sini. Konten dibangun pada Sprint 4.
      </p>
    </section>
  );
}
