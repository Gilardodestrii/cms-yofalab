import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";
import { PostRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

type PostRow = {
  id: string;
  title: string;
  categoryName: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string;
  scheduled: boolean;
};

const columns: Column<PostRow>[] = [
  { key: "title", header: "Judul", sortable: true, render: (r) => r.title },
  { key: "categoryName", header: "Kategori", render: (r) => r.categoryName },
  { key: "authorName", header: "Penulis", render: (r) => r.authorName },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <span className="flex items-center gap-2">
        <Badge variant={r.status === "PUBLISHED" ? "success" : "warning"}>
          {r.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
        {r.scheduled && <Badge variant="info">Terjadwal</Badge>}
      </span>
    ),
  },
  { key: "publishedAt", header: "Terbit", sortable: true, render: (r) => r.publishedAt },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => (
      <span className="flex gap-2">
        <Link href={`/admin/posts/${r.id}/edit`} className="btn-admin-secondary h-8 px-3 text-xs">
          Ubah
        </Link>
        <PostRowActions id={r.id} title={r.title} />
      </span>
    ),
  },
];

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED"] as const;

const STATUS_LABEL: Record<(typeof STATUS_OPTIONS)[number], string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Daftar artikel (`/admin/posts`) dengan filter status + kategori. */
export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/posts");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(
    params,
    { defaultSort: "publishedAt", allowedSort: ["title", "publishedAt", "createdAt"] },
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

  const where: Prisma.PostWhereInput = {};
  if (search) where.title = { contains: search };
  if (statusFilter) where.status = statusFilter;
  if (categoryId !== undefined) where.categoryId = categoryId;

  const [items, total, categories] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    db.post.count({ where }),
    db.postCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const now = new Date();
  const rows: PostRow[] = items.map((p) => ({
    id: p.id.toString(),
    title: p.title,
    categoryName: p.category?.name ?? "—",
    authorName: p.author.name,
    status: p.status,
    publishedAt: formatDate(p.publishedAt),
    scheduled: p.status === "PUBLISHED" && p.publishedAt !== null && p.publishedAt > now,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Blog" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">Blog</h1>
          <p className="mt-1 font-body text-sm text-ink-600">{total} artikel.</p>
        </div>
        <Link href="/admin/posts/new" className="btn-admin">
          Tulis artikel
        </Link>
      </div>
      <DataTable
        basePath="/admin/posts"
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sort={sort}
        order={order}
        searchValue={search}
        searchPlaceholder="Cari judul artikel…"
        emptyState="Belum ada artikel."
        params={params}
        toolbar={
          <form method="get" action="/admin/posts" className="flex flex-wrap items-center gap-2">
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
