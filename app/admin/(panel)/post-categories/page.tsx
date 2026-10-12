import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DataTable, type Column } from "@/components/admin/data-table";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";
import { PostCategoryRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Kategori Blog",
  robots: { index: false, follow: false },
};

type PostCategoryRow = { id: string; name: string; slug: string; postCount: number };

const columns: Column<PostCategoryRow>[] = [
  { key: "name", header: "Nama", sortable: true, render: (r) => r.name },
  { key: "slug", header: "Slug", render: (r) => r.slug },
  { key: "postCount", header: "Artikel", render: (r) => r.postCount },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => (
      <span className="flex gap-2">
        <Link href={`/admin/post-categories/${r.id}/edit`} className="btn-admin-secondary h-8 px-3 text-xs">
          Ubah
        </Link>
        <PostCategoryRowActions id={r.id} name={r.name} />
      </span>
    ),
  },
];

/** Daftar kategori blog (`/admin/post-categories`). */
export default async function AdminPostCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/post-categories");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(
    params,
    { defaultSort: "name", allowedSort: ["name", "createdAt"] },
  );

  const where: Prisma.PostCategoryWhereInput = search
    ? { name: { contains: search } }
    : {};

  const [items, total] = await Promise.all([
    db.postCategory.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
    }),
    db.postCategory.count({ where }),
  ]);

  const rows: PostCategoryRow[] = items.map((c) => ({
    id: c.id.toString(),
    name: c.name,
    slug: c.slug,
    postCount: c._count.posts,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Kategori Blog" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">Kategori Blog</h1>
          <p className="mt-1 font-body text-sm text-ink-600">{total} kategori.</p>
        </div>
        <Link href="/admin/post-categories/new" className="btn-admin">
          Tambah kategori
        </Link>
      </div>
      <DataTable
        basePath="/admin/post-categories"
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
      params={params}
      />
    </div>
  );
}
