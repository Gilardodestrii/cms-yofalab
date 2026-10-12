import { db } from "./db";
import {
  aboutPageSchema,
  homePageSchema,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_HOME_CONTENT,
  type AboutPageContent,
  type HomePageContent,
} from "./validators/pages";

/**
 * Pembacaan konten halaman dinamis dari `pages`.
 * Fallback default dipakai bila baris belum ada atau DB belum siap.
 */

/** Konten Home (`pages.HOME`), selalu terisi (default bila kosong). */
export async function getHomePageContent(): Promise<HomePageContent> {
  const row = await db.page
    .findUnique({ where: { key: "HOME" }, select: { content: true } })
    .catch(() => null);
  if (!row) return DEFAULT_HOME_CONTENT;
  const parsed = homePageSchema.safeParse(row.content);
  if (!parsed.success) return DEFAULT_HOME_CONTENT;
  const data = parsed.data;
  // Isi bagian yang kosong dari default agar halaman tidak pernah blank.
  return {
    heroTitle: data.heroTitle || DEFAULT_HOME_CONTENT.heroTitle,
    heroSubtitle: data.heroSubtitle || DEFAULT_HOME_CONTENT.heroSubtitle,
    slides: data.slides,
    stats: data.stats.length > 0 ? data.stats : DEFAULT_HOME_CONTENT.stats,
    getToKnowTitle: data.getToKnowTitle || DEFAULT_HOME_CONTENT.getToKnowTitle,
    getToKnowBody: data.getToKnowBody || DEFAULT_HOME_CONTENT.getToKnowBody,
    advantages:
      data.advantages.length > 0 ? data.advantages : DEFAULT_HOME_CONTENT.advantages,
  };
}

/** Konten About Us (`pages.ABOUT`). */
export async function getAboutPageContent(): Promise<AboutPageContent> {
  const row = await db.page
    .findUnique({ where: { key: "ABOUT" }, select: { content: true } })
    .catch(() => null);
  if (!row) return DEFAULT_ABOUT_CONTENT;
  const parsed = aboutPageSchema.safeParse(row.content);
  return parsed.success ? parsed.data : DEFAULT_ABOUT_CONTENT;
}
