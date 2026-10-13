"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/** Kolom pencarian publik (menulis `q` ke query string). Perlu Suspense untuk useSearchParams.
 * Gaya: latar transparan/putih, border default brand-600 (#9B4478),
 * fokus/klik brand-800 (#683352); teks dan ikon hitam. */
function SearchInputInner({
  placeholder = "Cari…",
  name = "q",
  basePath,
}: {
  placeholder?: string;
  name?: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form
      role="search"
      className="relative w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get(name);
        const params = new URLSearchParams(searchParams.toString());
        if (typeof value === "string" && value.trim()) params.set(name, value.trim());
        else params.delete(name);
        params.delete("page");
        const qs = params.toString();
        router.push(basePath ? `${basePath}?${qs}` : `?${qs}`, { scroll: false });
      }}
    >
      <input
        type="search"
        name={name}
        defaultValue={searchParams.get(name) ?? ""}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-full border border-brand-600 bg-transparent pl-5 pr-12 font-body text-sm text-ink-900 placeholder:text-ink-900 focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800"
      />
      <button
        type="submit"
        aria-label="Cari"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-900 hover:text-brand-600"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-5 w-5"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

export function SearchInput(props: { placeholder?: string; name?: string; basePath?: string }) {
  return (
    <Suspense
      fallback={
        <div
          className="h-11 w-full max-w-md rounded-full border border-brand-600 bg-transparent"
          aria-hidden="true"
        />
      }
    >
      <SearchInputInner {...props} />
    </Suspense>
  );
}
