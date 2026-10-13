/**
 * Kamus terjemahan YOFALAB (EN default, ID opsional).
 * Hanya string UI statis — konten dinamis dari DB tidak diterjemahkan.
 * ponytail: bila teks berkembang > 60 entri, pisah per halaman.
 */

export type Locale = "en" | "id";
export const LOCALES: Locale[] = ["en", "id"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

const dict = {
  // --- Header nav ---
  nav: {
    home: { en: "Home", id: "Home" },
    product: { en: "Product", id: "Produk" },
    blog: { en: "Blog", id: "Blog" },
    about: { en: "About Us", id: "Tentang Kami" },
    contact: { en: "Contact Us", id: "Hubungi Kami" },
  },

  // --- Home page ---
  home: {
    heroCta1: { en: "Contact Us", id: "Hubungi Kami" },
    heroCta2: { en: "View Products", id: "Lihat Produk" },
    productCategory: { en: "Product Category", id: "Kategori Produk" },
    viewAll: { en: "View all →", id: "Lihat semua →" },
    noCategory: { en: "Product categories coming soon.", id: "Kategori produk segera hadir." },
    latestBlog: { en: "Latest Blog", id: "Blog Terbaru" },
    searchBlog: { en: "Search articles…", id: "Cari artikel…" },
    noPosts: { en: "Articles coming soon.", id: "Artikel segera hadir." },
    allArticles: { en: "View all articles →", id: "Lihat semua artikel →" },
    readMore: { en: "Read more", id: "Baca selengkapnya" },
    learnMore: { en: "Learn more →", id: "Pelajari lebih lanjut →" },
    getToKnow: { en: "Get to Know YOFALAB", id: "Mengenal YOFALAB" },
  },

  // --- About page ---
  about: {
    title: { en: "About Us", id: "Tentang Kami" },
    sectionTitle: { en: "About YOFALAB", id: "Tentang YOFALAB" },
    noProfile: {
      en: "Company profile not filled yet.",
      id: "Profil perusahaan belum diisi.",
    },
    notFilled: { en: "Not filled yet.", id: "Belum diisi." },
    vision: { en: "Vision", id: "Visi" },
    mission: { en: "Mission", id: "Misi" },
    rnd: { en: "Research & Development", id: "Riset & Pengembangan" },
    breadcrumb: { en: "About Us", id: "Tentang Kami" },
  },

  // --- Contact page ---
  contact: {
    title: { en: "Contact Us", id: "Hubungi Kami" },
    subtitle: {
      en: "Send your product inquiries, price requests, or distribution partnership.",
      id: "Kirim pertanyaan tentang produk, permintaan penawaran, atau kerja sama distribusi.",
    },
    sendMessage: { en: "Send a Message", id: "Kirim Pesan" },
    notFilled: { en: "Not filled yet.", id: "Belum diisi." },
    breadcrumb: { en: "Contact Us", id: "Hubungi Kami" },
    address: { en: "Address", id: "Alamat" },
    phone: { en: "Phone", id: "Telepon" },
    whatsapp: { en: "WhatsApp", id: "WhatsApp" },
    email: { en: "Email", id: "Email" },
  },

  // --- Blog page ---
  blog: {
    title: { en: "Blog", id: "Blog" },
    searchPlaceholder: { en: "Search articles…", id: "Cari artikel…" },
    allCategory: { en: "All", id: "Semua" },
    noArticles: { en: "No articles found.", id: "Artikel tidak ditemukan." },
    readMore: { en: "Read more →", id: "Baca selengkapnya →" },
    breadcrumb: { en: "Blog", id: "Blog" },
  },

  // --- Product page ---
  product: {
    title: { en: "Product", id: "Produk" },
    searchPlaceholder: { en: "Search products…", id: "Cari produk…" },
    allCategory: { en: "All", id: "Semua" },
    noProducts: { en: "No products found.", id: "Produk tidak ditemukan." },
    viewDetail: { en: "View Detail →", id: "Lihat Detail →" },
    breadcrumb: { en: "Product", id: "Produk" },
  },

  // --- Common ---
  common: {
    home: { en: "Home", id: "Home" },
  },
} as const;

export type Dict = typeof dict;

/** Ambil nilai locale dari dict. */
export function t<
  S extends keyof Dict,
  K extends keyof Dict[S],
>(section: S, key: K, locale: Locale): string {
  const entry = dict[section][key] as Record<Locale, string>;
  return entry[locale] ?? entry[DEFAULT_LOCALE];
}
