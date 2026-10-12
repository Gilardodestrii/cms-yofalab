import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DataTable, type Column } from "@/components/admin/data-table";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";
import { CategoryRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Kategori Produk",
  robots: { index: false, follow: false },
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
};

const columns: Column<CategoryRow>[] = [
  { key: "name", header: "Nama", sortable: true, render: (r) => r.name },
  { key: "slug", header: "Slug", render: (r) => r.slug },
  {
    key: "sortOrder",
    header: "Urutan",
    sortable: true,
    render: (r) => r.sortOrder,
  },
  {
    key: "productCount",
    header: "Produk",
    render: (r) => r.productCount,
  },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => (
      <span className="flex gap-2">
        <Link href={`/admin/categories/${r.id}/edit`} className="btn-admin-secondary h-8 px-3 text-xs">
          Ubah
        </Link>
        <CategoryRowActions id={r.id} name={r.name} />
      </span>
    ),
  },
];

/** Daftar kategori produk (`/admin/categories`). Berhak: Super Admin & Editor. */
export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/categories");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(
    params,
    { defaultSort: "sortOrder", allowedSort: ["name", "sortOrder", "createdAt"] },
  );

  const where: Prisma.ProductCategoryWhereInput = search
    ? { name: { contains: search } }
    : {};

  const [items, total] = await Promise.all([
    db.productCategory.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        _count: { select: { products: true } },
      },
    }),
    db.productCategory.count({ where }),
  ]);

  const rows: CategoryRow[] = items.map((c) => ({
    id: c.id.toString(),
    name: c.name,
    slug: c.slug,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Kategori" }]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">
            Kategori Produk
          </h1>
          <p className="mt-1 font-body text-sm text-ink-600">
            Kelompok katalog produk: {total} kategori.
          </p>
        </div>
        <Link href="/admin/categories/new" className="btn-admin">
          Tambah kategori
        </Link>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sort={sort}
        order={order}
        searchValue={search}
        searchPlaceholder="Cari nama kategori…"
        emptyState="Belum ada kategori."
      />
    </div>
  );
}
