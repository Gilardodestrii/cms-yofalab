import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";
import { ProductRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Produk",
  robots: { index: false, follow: false },
};

type ProductRow = {
  id: string;
  name: string;
  categoryName: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortOrder: number;
};

const STATUS_VARIANT = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "brand",
} as const;

const STATUS_LABEL = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Arsip",
} as const;

const columns: Column<ProductRow>[] = [
  { key: "name", header: "Nama", sortable: true, render: (r) => r.name },
  { key: "category", header: "Kategori", render: (r) => r.categoryName },
  {
    key: "status",
    header: "Status",
    render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>,
  },
  { key: "sortOrder", header: "Urutan", sortable: true, render: (r) => r.sortOrder },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => (
      <span className="flex gap-2">
        <Link href={`/admin/products/${r.id}/edit`} className="btn-admin-secondary h-8 px-3 text-xs">
          Ubah
        </Link>
        <ProductRowActions id={r.id} name={r.name} />
      </span>
    ),
  },
];

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

/** Daftar produk (`/admin/products`) dengan filter status + kategori. */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/products");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(
    params,
    { defaultSort: "sortOrder", allowedSort: ["name", "sortOrder", "createdAt"] },
  );

  const statusRaw = typeof params.status === "string" ? params.status : "";
  const statusFilter = (STATUS_OPTIONS as readonly string[]).includes(statusRaw)
    ? (statusRaw as (typeof STATUS_OPTIONS)[number])
    : undefined;
  const categoryRaw = typeof params.categoryId === "string" ? params.categoryId : "";
  let categoryId: bigint | undefined;
  try {
    if (categoryRaw) categoryId = BigInt(categoryRaw);
  } catch {
    categoryId = undefined;
  }

  const where: Prisma.ProductWhereInput = {};
  if (search) where.name = { contains: search };
  if (statusFilter) where.status = statusFilter;
  if (categoryId !== undefined) where.categoryId = categoryId;

  const [items, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: {
        id: true,
        name: true,
        status: true,
        sortOrder: true,
        category: { select: { name: true } },
      },
    }),
    db.product.count({ where }),
    db.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: ProductRow[] = items.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    categoryName: p.category.name,
    status: p.status,
    sortOrder: p.sortOrder,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Produk" }]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">Produk</h1>
          <p className="mt-1 font-body text-sm text-ink-600">
            Katalog produk: {total} item.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-admin">
          Tambah produk
        </Link>
      </div>
      <DataTable
        basePath="/admin/products"
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sort={sort}
        order={order}
        searchValue={search}
        searchPlaceholder="Cari nama produk…"
        emptyState="Belum ada produk."
        params={params}
        toolbar={
          <form method="get" action="/admin/products" className="flex flex-wrap items-center gap-2">
            {params.q ? <input type="hidden" name="q" value={String(params.q)} /> : null}
            <select
              name="status"
              defaultValue={statusFilter ?? ""}
              aria-label="Filter status"
              className="input-admin h-9 w-auto"
            >
              <option value="">Semua status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <select
              name="categoryId"
              defaultValue={categoryRaw}
              aria-label="Filter kategori"
              className="input-admin h-9 w-auto"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id.toString()} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="btn-admin-secondary h-9">Filter</button>
          </form>
        }
        />
    </div>
  );
}
