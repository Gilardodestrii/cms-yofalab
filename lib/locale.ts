import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n";

/** Baca locale dari cookie request (server-side). */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const val = jar.get(LOCALE_COOKIE)?.value;
  return LOCALES.includes(val as Locale) ? (val as Locale) : DEFAULT_LOCALE;
}
