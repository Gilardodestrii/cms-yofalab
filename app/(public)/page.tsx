import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { CategoryLabel } from "@/components/ui/category-label";

export const metadata: Metadata = {
  title: "Home",
  description:
    "YOFALAB Indonesia - penyedia alat kesehatan dan reagen laboratorium terpercaya sejak 2015.",
};

/**
 * Halaman Home (placeholder Sprint 1).
 * Konten hero, statistik, keunggulan, kategori, dan blog menyusul di Sprint 4.
 */
export default function HomePage() {
  return (
    <section className="container-site py-16 md:py-24">
      <CategoryLabel>Home</CategoryLabel>
      <h1 className="mt-2 text-4xl font-bold md:text-5xl">
        Alat Kesehatan dan Reagen Laboratorium Terpercaya
      </h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        YOFALAB Indonesia menyediakan produk alat kesehatan berkualitas untuk
        laboratorium, klinik, rumah sakit, dan distributor. Konten halaman ini
        akan dibangun pada Sprint 4.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/contact" variant="hero">
          Contact Us
        </ButtonLink>
        <ButtonLink href="/product" variant="outline">
          Lihat Produk
        </ButtonLink>
      </div>
    </section>
  );
}

