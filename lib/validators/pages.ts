import { z } from "zod";

/** Satu slide hero Home (gambar + tautan). */
export const heroSlideSchema = z.object({
  title: z.string().trim().max(190).default(""),
  subtitle: z.string().trim().max(500).default(""),
  /** Path media gambar slide (kosong = tanpa gambar). */
  imagePath: z.string().trim().max(500).default(""),
  linkLabel: z.string().trim().max(80).default(""),
  linkHref: z.string().trim().max(300).default(""),
});

export type HeroSlide = z.infer<typeof heroSlideSchema>;

/** Satu statistik Home (nilai + label). */
export const statSchema = z.object({
  value: z.string().trim().max(40).default(""),
  label: z.string().trim().max(80).default(""),
});

export type Stat = z.infer<typeof statSchema>;

/** Satu keunggulan Home (judul + isi). */
export const advantageSchema = z.object({
  title: z.string().trim().max(120).default(""),
  body: z.string().trim().max(600).default(""),
});

export type Advantage = z.infer<typeof advantageSchema>;

/** Konten halaman Home (`pages.HOME`). */
export const homePageSchema = z.object({
  heroTitle: z.string().trim().max(190).default(""),
  heroSubtitle: z.string().trim().max(500).default(""),
  slides: z.array(heroSlideSchema).max(8).default([]),
  stats: z.array(statSchema).max(6).default([]),
  getToKnowTitle: z.string().trim().max(190).default(""),
  getToKnowBody: z.string().trim().max(2000).default(""),
  advantages: z.array(advantageSchema).max(6).default([]),
});

export type HomePageContent = z.infer<typeof homePageSchema>;

/** Konten halaman About Us (`pages.ABOUT`). */
export const aboutPageSchema = z.object({
  profile: z.string().trim().max(4000).default(""),
  vision: z.string().trim().max(2000).default(""),
  /** Misi sebagai daftar poin (satu baris per poin di textarea). */
  mission: z.array(z.string().trim().max(500)).max(20).default([]),
  rnd: z.string().trim().max(4000).default(""),
});

export type AboutPageContent = z.infer<typeof aboutPageSchema>;

/** Isi default Home bila `pages.HOME` belum diisi. */
export const DEFAULT_HOME_CONTENT: HomePageContent = {
  heroTitle: "Alat Kesehatan dan Reagen Laboratorium Terpercaya",
  heroSubtitle:
    "Melayani laboratorium, klinik, rumah sakit, dan distributor sejak 2015 dengan produk berkualitas dan dukungan ahli.",
  slides: [],
  stats: [
    { value: "2015", label: "Established" },
    { value: "20+", label: "Products" },
    { value: "20+", label: "Partners" },
  ],
  getToKnowTitle: "Mitra laboratorium Anda sejak 2015",
  getToKnowBody:
    "YOFALAB Indonesia menyediakan alat kesehatan, reagen, dan layanan pelatihan untuk laboratorium di seluruh Indonesia.",
  advantages: [
    {
      title: "High Quality",
      body: "Produk alat kesehatan dan reagen dengan standar mutu terjamin untuk hasil laboratorium yang akurat.",
    },
    {
      title: "Comprehensive Support",
      body: "Dukungan purna jual menyeluruh: instalasi, kalibrasi, dan layanan teknis responsif.",
    },
    {
      title: "Expert Training",
      body: "Pelatihan penggunaan alat oleh tim ahli agar staf laboratorium siap pakai sejak hari pertama.",
    },
  ],
};

/** Isi default About bila `pages.ABOUT` belum diisi. */
export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  profile: "",
  vision: "",
  mission: [],
  rnd: "",
};
