import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description:
    "Katalog produk alat kesehatan YOFALAB Indonesia: Blood Grouping Reagent, Vacuum Blood Collection, dan Hemoglobin Meter.",
};

/** Halaman daftar produk (placeholder Sprint 1). Grid + filter menyusul di Sprint 4. */
export default function ProductPage() {
  return (
    <section className="container-site py-16 md:py-24">
      <p className="label-caps">Product</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Katalog Produk</h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        Daftar produk alat kesehatan dan reagen akan tampil di sini. Grid,
        filter kategori, dan pencarian dibangun pada Sprint 4.
      </p>
    </section>
  );
}
