"use client";

import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n";

/**
 * Tombol toggle bahasa di header publik.
 * Simpan pilihan ke cookie `lang`, lalu reload agar server re-render.
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  function switchTo(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 rounded-sm border border-line bg-surface px-1 py-0.5">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          aria-pressed={current === loc}
          className={
            "rounded-sm px-2 py-1 font-heading text-xs font-semibold uppercase transition-colors duration-150 " +
            (current === loc
              ? "bg-brand-600 text-white"
              : "text-ink-600 hover:bg-surface-muted hover:text-ink-900")
          }
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
