import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import { roleLabels } from "@/lib/auth/roles";
import { UserRowActions } from "./row-actions";

export const metadata: Metadata = {
  title: "Pengguna",
  robots: { index: false, follow: false },
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
};

const columns: Column<UserRow>[] = [
  { key: "name", header: "Nama", sortable: true, render: (r) => r.name },
  { key: "email", header: "Email", sortable: true, render: (r) => r.email },
  { key: "role", header: "Peran", render: (r) => roleLabels[r.role as keyof typeof roleLabels] ?? r.role },
  {
    key: "isActive",
    header: "Status",
    render: (r) => <Badge variant={r.isActive ? "success" : "danger"}>{r.isActive ? "Aktif" : "Nonaktif"}</Badge>,
  },
  { key: "lastLoginAt", header: "Login terakhir", sortable: true, render: (r) => r.lastLoginAt },
  {
    key: "actions",
    header: "Aksi",
    render: (r) => (
      <span className="flex gap-2">
        <Link href={`/admin/users/${r.id}/edit`} className="btn-admin-secondary h-8 px-3 text-xs">
          Ubah
        </Link>
        <UserRowActions id={r.id} name={r.name} />
      </span>
    ),
  },
];

function formatDateTime(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Manajemen pengguna (`/admin/users`). Hanya SUPER_ADMIN. */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["SUPER_ADMIN"], "/admin/users");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(params, {
    defaultSort: "createdAt",
    allowedSort: ["name", "email", "lastLoginAt", "createdAt"],
  });

  const where = search
    ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
    : {};

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true },
    }),
    db.user.count({ where }),
  ]);

  const rows: UserRow[] = items.map((u) => ({
    id: u.id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    lastLoginAt: formatDateTime(u.lastLoginAt),
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Pengguna" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">Pengguna</h1>
          <p className="mt-1 font-body text-sm text-ink-600">{total} akun admin.</p>
        </div>
        <Link href="/admin/users/new" className="btn-admin">
          Tambah pengguna
        </Link>
      </div>
      <DataTable
        basePath="/admin/users"
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sort={sort}
        order={order}
        searchValue={search}
        searchPlaceholder="Cari nama atau email…"
        emptyState="Belum ada pengguna."
      params={params}
      />
    </div>
  );
}
