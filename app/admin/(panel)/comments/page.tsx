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
import { CommentRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Komentar",
  robots: { index: false, follow: false },
};

type CommentRow = {
  id: string;
  name: string;
  email: string;
  body: string;
  postTitle: string;
  postSlug: string;
  status: "PENDING" | "APPROVED" | "SPAM";
  createdAt: string;
};

const columns: Column<CommentRow>[] = [
  { key: "name", header: "Nama", sortable: true, render: (r) => r.name },
  { key: "email", header: "Email", render: (r) => r.email },
  {
    key: "body",
    header: "Komentar",
    render: (r) => <span className="line-clamp-3 block max-w-md">{r.body}</span>,
  },
  {
    key: "postTitle",
    header: "Artikel",
    render: (r) => (
      <Link href={`/blog/${r.postSlug}`} className="text-brand-600 hover:underline" target="_blank">
        {r.postTitle}
      </Link>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge
        variant={r.status === "APPROVED" ? "success" : r.status === "SPAM" ? "danger" : "warning"}
      >
        {r.status === "APPROVED" ? "Disetujui" : r.status === "SPAM" ? "Spam" : "Menunggu"}
      </Badge>
    ),
  },
  { key: "createdAt", header: "Masuk", sortable: true, render: (r) => r.createdAt },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => <CommentRowActions id={r.id} status={r.status} authorName={r.name} />,
  },
];

const STATUS_OPTIONS = ["PENDING", "APPROVED", "SPAM"] as const;

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Strip tag agar cuplikan komentar aman di tabel admin. */
function toPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Moderasi komentar (`/admin/comments`): setujui, tolak, spam, hapus. */
export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/comments");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(params, {
    defaultSort: "createdAt",
    allowedSort: ["createdAt", "name"],
  });

  const statusRaw = typeof params.status === "string" ? params.status : "";
  const statusFilter = (STATUS_OPTIONS as readonly string[]).includes(statusRaw)
    ? (statusRaw as (typeof STATUS_OPTIONS)[number])
    : undefined;

  const where: Prisma.CommentWhereInput = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }, { body: { contains: search } }];
  }

  const [items, total, pendingCount] = await Promise.all([
    db.comment.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        body: true,
        status: true,
        createdAt: true,
        post: { select: { title: true, slug: true } },
      },
    }),
    db.comment.count({ where }),
    db.comment.count({ where: { status: "PENDING" } }),
  ]);

  const rows: CommentRow[] = items.map((c) => ({
    id: c.id.toString(),
    name: c.name,
    email: c.email,
    body: toPlainText(c.body).slice(0, 300),
    postTitle: c.post.title,
    postSlug: c.post.slug,
    status: c.status,
    createdAt: formatDateTime(c.createdAt),
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Komentar" }]} />
      <div>
        <h1 className="font-heading text-lg font-semibold text-ink-900">Komentar</h1>
        <p className="mt-1 font-body text-sm text-ink-600">
          {total} komentar{pendingCount > 0 && ` · ${pendingCount} menunggu moderasi`}.
        </p>
      </div>
      <form className="flex flex-wrap gap-2" method="get">
        {search && <input type="hidden" name="q" value={search} />}
        <select name="status" defaultValue={statusFilter ?? ""} aria-label="Filter status" className="input-admin w-auto">
          <option value="">Semua status</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED">Disetujui</option>
          <option value="SPAM">Spam</option>
        </select>
        <button type="submit" className="btn-admin-secondary">Filter</button>
      </form>
      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sort={sort}
        order={order}
        searchValue={search}
        searchPlaceholder="Cari nama, email, atau isi komentar…"
        emptyState="Belum ada komentar."
      />
    </div>
  );
}
