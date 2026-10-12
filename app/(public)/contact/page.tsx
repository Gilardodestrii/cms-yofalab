import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Hubungi YOFALAB Indonesia: alamat, telepon, WhatsApp, dan email untuk informasi produk dan kerja sama.",
};

/** Halaman Contact Us (placeholder Sprint 1). Formulir + kirim email menyusul di Sprint 6. */
export default function ContactPage() {
  return (
    <section className="container-site py-16 md:py-24">
      <p className="label-caps">Contact Us</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Hubungi Kami</h1>
      <p className="mt-4 max-w-reading font-body text-base text-ink-600">
        Formulir kontak dan peta lokasi akan tampil di sini. Formulir, honeypot,
        dan notifikasi email dibangun pada Sprint 6.
      </p>
    </section>
  );
}
