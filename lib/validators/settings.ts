import { z } from "zod";

/** Info kontak situs (`site_settings.contact`). */
export const contactSettingSchema = z.object({
  address: z.string().trim().max(500).default(""),
  phone: z.string().trim().max(60).default(""),
  whatsapp: z.string().trim().max(60).default(""),
  email: z.string().trim().max(190).default(""),
});

export type ContactSetting = z.infer<typeof contactSettingSchema>;

/** Footer situs (`site_settings.footer`). */
export const footerSettingSchema = z.object({
  copyright: z.string().trim().max(300).default(""),
  description: z.string().trim().max(500).default(""),
  facebook: z.string().trim().max(300).default(""),
  instagram: z.string().trim().max(300).default(""),
  linkedin: z.string().trim().max(300).default(""),
  youtube: z.string().trim().max(300).default(""),
});

export type FooterSetting = z.infer<typeof footerSettingSchema>;

/** Identitas + SEO default situs (`site_settings.site`). */
export const siteSettingSchema = z.object({
  name: z.string().trim().min(1, "Nama situs wajib diisi").max(120),
  /** Logo header (latar terang). Path `/uploads/...`, dikelola via MediaPicker. */
  logoPath: z.string().trim().max(300).default(""),
  /** Logo footer putih (latar brand-600). Path `/uploads/...`, dikelola via MediaPicker. */
  logoWhitePath: z.string().trim().max(300).default(""),
  tagline: z.string().trim().max(190).default(""),
  seoTitle: z.string().trim().max(190).default(""),
  seoDescription: z.string().trim().max(320).default(""),
  /** Email penerima notifikasi pesan kontak (kosong = pakai env MAIL_TO). */
  notifyEmail: z.string().trim().max(190).default(""),
});

export type SiteSetting = z.infer<typeof siteSettingSchema>;

/** Ukuran unggahan media (dipakai Sprint 7 di halaman Pengaturan). */
export const uploadSettingSchema = z.object({
  maxUploadMb: z.coerce.number().int().min(1).max(50).default(5),
});

export type UploadSetting = z.infer<typeof uploadSettingSchema>;
