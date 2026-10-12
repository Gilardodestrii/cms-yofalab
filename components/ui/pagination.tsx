import Link from "next/link";

/** Tautan paginasi publik (server-rendered, via query string `page`). */
export function Pagination({
  page,
  totalPages,
  basePath,
  query,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams({ ...query, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  // Jendela halaman: tampilkan maks 5 nomor di sekitar halaman aktif.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => start + i,
  ).filter((p) => p >= 1 && p <= totalPages);

  return (
    <nav aria-label="Paginasi" className="flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className="btn-admin-secondary h-9 px-3 text-sm" aria-label="Halaman sebelumnya">
          ← Prev
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Halaman ${p}`}
          className={
            p === page
              ? "inline-flex h-9 min-w-9 items-center justify-center rounded-sm bg-brand-600 px-3 font-heading text-sm font-semibold text-white"
              : "btn-admin-secondary h-9 min-w-9 px-3 text-sm"
          }
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} className="btn-admin-secondary h-9 px-3 text-sm" aria-label="Halaman berikutnya">
          Next →
        </Link>
      )}
    </nav>
  );
}
