/** Konfigurasi situs dan navigasi publik. */
export const siteConfig = {
  name: "YOFALAB Indonesia",
  description:
    "Company profile dan katalog produk alat kesehatan YOFALAB Indonesia.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { label: "Home", href: "/" },
    { label: "Product", href: "/product" },
    { label: "Blog", href: "/blog" },
    { label: "About Us", href: "/about" },
    { label: "Contact us", href: "/contact" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];

/** Satu item menu sidebar admin. */
export type AdminNavItem = {
  label: string;
  href: string;
  /** Ikon sederhana berbasis teks (emoji) agar tanpa dependensi ikon. */
  icon: string;
  /** Bila diisi, hanya peran ini yang melihat item (RBAC UI). */
  roles?: readonly ("SUPER_ADMIN" | "EDITOR" | "CS")[];
};

/** Grup menu sidebar admin, selaras Design System bagian "Sidebar". */
export const adminNav: { group: string; items: AdminNavItem[] }[] = [
  {
    group: "Konten",
    items: [
      { label: "Dashboard", href: "/admin", icon: "▦" },
      { label: "Produk", href: "/admin/products", icon: "▣" },
      { label: "Kategori", href: "/admin/categories", icon: "◈" },
      { label: "Blog", href: "/admin/posts", icon: "✎" },
      { label: "Komentar", href: "/admin/comments", icon: "❝" },
      { label: "Halaman", href: "/admin/pages", icon: "▤" },
      { label: "Media", href: "/admin/media", icon: "▧" },
    ],
  },
  {
    group: "Komunikasi",
    items: [{ label: "Pesan Kontak", href: "/admin/messages", icon: "✉" }],
  },
  {
    group: "Sistem",
    items: [
      {
        label: "Pengaturan",
        href: "/admin/settings",
        icon: "⚙",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Pengguna",
        href: "/admin/users",
        icon: "☰",
        roles: ["SUPER_ADMIN"],
      },
      { label: "Log Aktivitas", href: "/admin/logs", icon: "≡" },
    ],
  },
];

