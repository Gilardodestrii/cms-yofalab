/** Utilitas paginasi server-side untuk DataTable admin. */

export const DEFAULT_PER_PAGE = 10;
const ALLOWED_PER_PAGE = [10, 25, 50, 100];

export type PaginationState = {
  page: number;
  perPage: number;
  skip: number;
  take: number;
  /** Pencarian teks bebas (sudah di-trim, maks 100 karakter). */
  search: string;
  sort: string;
  order: "asc" | "desc";
};

/**
 * Baca parameter paginasi/urutan dari `searchParams`.
 * Nilai di-clamp agar tidak bisa disalahgunakan (mis. perPage raksasa).
 */
export function parsePagination(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  options: { defaultSort: string; allowedSort: string[] },
): PaginationState {
  const get = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const pageRaw = Number.parseInt(get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const perPageRaw = Number.parseInt(get("perPage") ?? "", 10);
  const perPage = ALLOWED_PER_PAGE.includes(perPageRaw)
    ? perPageRaw
    : DEFAULT_PER_PAGE;

  const search = (get("q") ?? "").trim().slice(0, 100);

  const sortRaw = get("sort");
  const sort =
    sortRaw && options.allowedSort.includes(sortRaw)
      ? sortRaw
      : options.defaultSort;

  const order = get("order") === "desc" ? "desc" : "asc";

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
    search,
    sort,
    order,
  };
}
