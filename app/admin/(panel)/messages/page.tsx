import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { ADMIN_BASE_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";
import { MessageRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Pesan Kontak",
  robots: { index: false, follow: false },
};

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: "NEW" | "READ" | "FOLLOWED_UP";
  createdAt: string;
};

const STATUS_LABEL: Record<MessageRow["status"], string> = {
  NEW: "Baru",
  READ: "Dibaca",
  FOLLOWED_UP: "Ditindaklanjuti",
};

const STATUS_VARIANT: Record<MessageRow["status"], "warning" | "info" | "success"> = {
  NEW: "warning",
  READ: "info",
  FOLLOWED_UP: "success",
};

const columns: Column<MessageRow>[] = [
  {
    key: "name",
    header: "Pengirim",
    sortable: true,
    render: (r) => (
      <span className="flex flex-col">
        <span>{r.name}</span>
        <span className="font-body text-xs text-ink-400">{r.email}</span>
      </span>
    ),
  },
  {
    key: "subject",
    header: "Subjek",
    render: (r) => (
      <Link href={`/admin/messages/${r.id}`} className="text-brand-600 hover:underline">
        {r.subject || "(tanpa subjek)"}
      </Link>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>,
  },
  { key: "createdAt", header: "Masuk", sortable: true, render: (r) => r.createdAt },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => <MessageRowActions id={r.id} status={r.status} senderName={r.name} />,
  },
];

const STATUS_OPTIONS = ["NEW", "READ", "FOLLOWED_UP"] as const;

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Daftar pesan kontak (`/admin/messages`) + ekspor CSV menghormati filter. */
export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(ADMIN_BASE_ROLES, "/admin/messages");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(params, {
    defaultSort: "createdAt",
    allowedSort: ["createdAt", "name"],
  });

  const statusRaw = typeof params.status === "string" ? params.status : "";
  const statusFilter = (STATUS_OPTIONS as readonly string[]).includes(statusRaw)
    ? (statusRaw as (typeof STATUS_OPTIONS)[number])
    : undefined;

  const where: Prisma.ContactMessageWhereInput = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
      { message: { contains: search } },
    ];
  }

  const [items, total, newCount] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const rows: MessageRow[] = items.map((m) => ({
    id: m.id.toString(),
    name: m.name,
    email: m.email,
    subject: m.subject ?? "",
    status: m.status,
    createdAt: formatDateTime(m.createdAt),
  }));

  // Ekspor mengikuti filter aktif.
  const exportParams = new URLSearchParams();
  if (statusFilter) exportParams.set("status", statusFilter);
  if (search) exportParams.set("q", search);
  const exportHref = `/api/messages/export${exportParams.size > 0 ? `?${exportParams}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Pesan Kontak" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">Pesan Kontak</h1>
          <p className="mt-1 font-body text-sm text-ink-600">
            {total} pesan{newCount > 0 && ` · ${newCount} belum dibaca`}.
          </p>
        </div>
        <a href={exportHref} className="btn-admin-secondary" download>
          Ekspor CSV
        </a>
      </div>
      <form className="flex flex-wrap gap-2" method="get">
        {search && <input type="hidden" name="q" value={search} />}
        <select name="status" defaultValue={statusFilter ?? ""} aria-label="Filter status" className="input-admin w-auto">
          <option value="">Semua status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
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
        searchPlaceholder="Cari nama, email, subjek, atau isi pesan…"
        emptyState="Belum ada pesan."
      />
    </div>
  );
}
