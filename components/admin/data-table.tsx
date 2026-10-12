"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  /** Bila true, header dapat diklik untuk mengurutkan (server-side). */
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  perPage: number;
  /** Kolom yang sedang diurutkan (server-side). */
  sort?: string;
  order?: "asc" | "desc";
  searchValue?: string;
  searchPlaceholder?: string;
  emptyState?: ReactNode;
  /** Kontrol filter tambahan (mis. dropdown status). */
  toolbar?: ReactNode;
};

const PER_PAGE_OPTIONS = [10, 25, 50];

/**
 * Tabel data admin dengan pencarian, urutan, dan paginasi **server-side**.
 * Semua perubahan ditulis ke query string sehingga server memuat ulang data.
 */
export function DataTable<T>({
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
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const toggleSort = (key: string) => {
    const nextOrder = sort === key && order === "asc" ? "desc" : "asc";
    updateParams({ sort: key, order: nextOrder, page: "1" });
  };

  return (
    <div className="panel-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("q");
            updateParams({
              q: typeof value === "string" ? value : null,
              page: "1",
            });
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={searchValue}
            placeholder={searchPlaceholder}
            aria-label="Cari"
            className="input-admin max-w-xs"
          />
        </form>
        {toolbar}
        <label className="ml-auto flex items-center gap-2 font-body text-sm text-ink-600">
          <span className="sr-only">Baris per halaman</span>
          <select
            aria-label="Baris per halaman"
            className="input-admin h-9 w-auto"
            value={perPage}
            onChange={(e) => updateParams({ perPage: e.target.value, page: "1" })}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / halaman
              </option>
            ))}
          </select>
        </label>
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
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 uppercase hover:text-brand-500"
                      aria-label={`Urutkan berdasarkan ${col.header}`}
                    >
                      {col.header}
                      <span aria-hidden="true">
                        {sort === col.key ? (order === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={pending ? "opacity-60" : ""}>
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
                  key={i}
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
          Menampilkan {rows.length === 0 ? 0 : (page - 1) * perPage + 1}–
          {(page - 1) * perPage + rows.length} dari {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-admin-secondary"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            Sebelumnya
          </button>
          <span aria-current="page">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn-admin-secondary"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
