import { db } from "./db";
import {
  contactSettingSchema,
  footerSettingSchema,
  siteSettingSchema,
  type ContactSetting,
  type FooterSetting,
  type SiteSetting,
} from "./validators/settings";

/**
 * Pembacaan pengaturan situs dari `site_settings`.
 * Semua fungsi memakai fallback aman bila DB belum siap (mis. saat build),
 * sehingga halaman publik tetap dapat dirender.
 */

export const SETTING_KEYS = {
  contact: "contact",
  footer: "footer",
  site: "site",
} as const;

/** PENGATURAN default bila baris belum ada di DB. */
export const DEFAULT_CONTACT: ContactSetting = {
  address:
    "Jl. Amarta No.12 A RT01, RW.01, Pelem, Baturetno, Banguntapan, Bantul Regency, Special Region of Yogyakarta 55198",
  phone: "(0274) 4436047",
  whatsapp: "+62 811-255-450",
  email: "info@yofalab.com",
};

export const DEFAULT_FOOTER: FooterSetting = {
  copyright: "Copyright © 2026 YOFALAB Indonesia. All rights reserved.",
  description: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

export const DEFAULT_SITE: SiteSetting = {
  name: "YOFALAB Indonesia",
  logoPath: "",
  logoWhitePath: "",
  tagline:
    "Company profile dan katalog produk alat kesehatan YOFALAB Indonesia.",
  seoTitle: "YOFALAB Indonesia — Alat Kesehatan & Reagen Laboratorium",
  seoDescription:
    "YOFALAB Indonesia menyediakan blood grouping reagent, vacuum blood collection, dan hemoglobin meter berkualitas untuk laboratorium.",
  notifyEmail: "",
};

type JsonRow = { value: unknown } | null;

function parseWith<T>(
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
  row: JsonRow,
  fallback: T,
): T {
  if (!row) return fallback;
  const parsed = schema.safeParse(row.value);
  return parsed.success ? parsed.data : fallback;
}

/** Info kontak situs (alamat, telepon, WhatsApp, email). */
export async function getContactSetting(): Promise<ContactSetting> {
  const row = await db.siteSetting
    .findUnique({ where: { key: SETTING_KEYS.contact }, select: { value: true } })
    .catch(() => null);
  return parseWith(contactSettingSchema, row, DEFAULT_CONTACT);
}

/** Footer situs (copyright, deskripsi, tautan sosial). */
export async function getFooterSetting(): Promise<FooterSetting> {
  const row = await db.siteSetting
    .findUnique({ where: { key: SETTING_KEYS.footer }, select: { value: true } })
    .catch(() => null);
  return parseWith(footerSettingSchema, row, DEFAULT_FOOTER);
}

/** Identitas + SEO default situs. */
export async function getSiteSetting(): Promise<SiteSetting> {
  const row = await db.siteSetting
    .findUnique({ where: { key: SETTING_KEYS.site }, select: { value: true } })
    .catch(() => null);
  return parseWith(siteSettingSchema, row, DEFAULT_SITE);
}

/** Nomor WhatsApp siap pakai untuk tautan `wa.me` (hanya digit). */
export function whatsappLink(whatsapp: string): string {
  const digits = whatsapp.replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
