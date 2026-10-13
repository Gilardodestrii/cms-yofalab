import Link from "next/link";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  /** Bila true, header menjadi tautan urut (server-side). */
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  /** Path halaman, mis. `/admin/products` (dipakai menyusun tautan). */
  basePath: string;
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  perPage: number;
  sort?: string;
  order?: "asc" | "desc";
  searchValue?: string;
  searchPlaceholder?: string;
  emptyState?: ReactNode;
  /** Kontrol filter tambahan (mis. dropdown status). */
  toolbar?: ReactNode;
  /** Query string aktif; parameter lain dipertahankan saat navigasi. */
  params: Record<string, string | string[] | undefined>;
  /**
   * Kunci stabil tiap baris (mis. `id`). Bila diisi, dipakai sebagai React
   * `key` agar komponen aksi per baris tidak tertukar identitas saat data
   * berubah (hapus/refresh). Default: indeks baris.
   */
  rowKey?: (row: T, index: number) => string;
};

const PER_PAGE_OPTIONS = [10, 25, 50];

/**
 * Tabel data admin dengan pencarian, urutan, dan paginasi **server-side**.
 *
 * Sengaja server component tanpa state klien: semua kontrol memakai tautan dan
 * form GET sehingga parameter lain (filter) ikut terbawa dan tidak ada batas
 * serialisasi antara server dan klien.
 */
export function DataTable<T>({
  basePath,
  columns,
  rows,
  total,
  page,
  perPage,
  sort,
  order = "asc",
  searchValue = "",
  searchPlaceholder = "Cari…",
  emptyState,
  toolbar,
  params,
  rowKey,
}: DataTableProps<T>) {
  /** Susun href dengan perubahan parameter, mempertahankan sisanya. */
  const href = (updates: Record<string, string | null>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) qs.append(key, v);
      } else {
        qs.set(key, value);
      }
    }
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") qs.delete(key);
      else qs.set(key, value);
    }
    const q = qs.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const firstRow = rows.length === 0 ? 0 : (page - 1) * perPage + 1;

  return (
    <div className="panel-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <form
          method="get"
          action={basePath}
          className="flex flex-wrap items-center gap-2"
        >
          {/* Pertahankan filter yang tidak diubah di form ini. */}
          {Object.entries(params).map(([key, value]) => {
            if (key === "q" || key === "page" || key === "perPage") return null;
            if (value === undefined) return null;
            const values = Array.isArray(value) ? value : [value];
            return values.map((v) => (
              <input key={`${key}-${v}`} type="hidden" name={key} value={v} />
            ));
          })}
          <input
            type="search"
            name="q"
            defaultValue={searchValue}
            placeholder={searchPlaceholder}
            aria-label="Cari"
            className="input-admin max-w-xs"
          />
          <label className="flex items-center gap-2 font-body text-sm text-ink-600">
            <span className="sr-only">Baris per halaman</span>
            <select
              name="perPage"
              aria-label="Baris per halaman"
              className="input-admin h-9 w-auto"
              defaultValue={String(perPage)}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / halaman
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-admin-secondary h-9">
            Terapkan
          </button>
        </form>
        {toolbar}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-brand-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`label-caps px-4 py-3 ${col.className ?? ""}`}
                  aria-sort={
                    col.sortable && sort === col.key
                      ? order === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.sortable ? (
                    <Link
                      href={href({
                        sort: col.key,
                        order:
                          sort === col.key && order === "asc" ? "desc" : "asc",
                        page: "1",
                      })}
                      className="inline-flex items-center gap-1 uppercase hover:text-brand-600"
                      aria-label={`Urutkan berdasarkan ${col.header}`}
                    >
                      {col.header}
                      <span aria-hidden="true">
                        {sort === col.key ? (order === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </Link>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center font-body text-sm text-ink-400"
                >
                  {emptyState ?? "Belum ada data."}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row, i) : i}
                  className="h-12 border-b border-line last:border-0 hover:bg-[#FAF6FB]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2 font-body text-sm text-ink-600 ${col.className ?? ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginasi */}
      <div className="flex items-center justify-between border-t border-line p-4 font-body text-sm text-ink-600">
        <span>
          Menampilkan {firstRow}–
          {rows.length === 0 ? 0 : (page - 1) * perPage + rows.length} dari{" "}
          {total}
        </span>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={href({ page: String(page - 1) })}
              className="btn-admin-secondary h-9"
            >
              Sebelumnya
            </Link>
          ) : (
            <span
              className="btn-admin-secondary h-9 opacity-50"
              aria-disabled="true"
            >
              Sebelumnya
            </span>
          )}
          <span aria-current="page">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={href({ page: String(page + 1) })}
              className="btn-admin-secondary h-9"
            >
              Berikutnya
            </Link>
          ) : (
            <span
              className="btn-admin-secondary h-9 opacity-50"
              aria-disabled="true"
            >
              Berikutnya
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
