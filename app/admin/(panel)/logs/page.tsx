import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { ADMIN_BASE_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Log Aktivitas",
  robots: { index: false, follow: false },
};

const ACTION_LABELS: Record<string, string> = {
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
  login: "Login",
  logout: "Logout",
  upload: "Unggah",
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Halaman Log Aktivitas (`/admin/logs`) dengan filter aksi + pencarian. */
export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(ADMIN_BASE_ROLES, "/admin/logs");

  const params = await searchParams;
  const { page, perPage, skip, take, search, sort, order } = parsePagination(
    params,
    {
      defaultSort: "createdAt",
      allowedSort: ["createdAt", "action", "entity"],
    },
  );

  const actionFilter =
    typeof params.action === "string" &&
    Object.keys(ACTION_LABELS).includes(params.action)
      ? params.action
      : undefined;

  const where: Prisma.ActivityLogWhereInput = {};
  if (actionFilter) where.action = actionFilter;
  if (search) {
    where.OR = [
      { entity: { contains: search } },
      { user: { name: { contains: search } } },
    ];
  }

  const [logs, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      // Tiebreaker `id` menjaga urutan stabil antar halaman.
      orderBy: [{ [sort]: order }, { id: order }],
      skip,
      take,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.activityLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Log" }]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-ink-900">
            Log Aktivitas
          </h1>
          <p className="mt-1 font-body text-sm text-ink-600">
            Riwayat aksi admin: {total} catatan.
          </p>
        </div>
        <form className="flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Cari entitas/pengguna…"
            aria-label="Cari log"
            className="input-admin w-56"
          />
          <select
            name="action"
            defaultValue={actionFilter ?? ""}
            aria-label="Filter aksi"
            className="input-admin w-auto"
          >
            <option value="">Semua aksi</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-admin">
            Filter
          </button>
        </form>
      </div>

      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-brand-50">
                <th className="label-caps px-4 py-3" scope="col">
                  Waktu
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  Pengguna
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  Aksi
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  Entitas
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  IP (hash)
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center font-body text-sm text-ink-400"
                  >
                    Belum ada log.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id.toString()}
                    className="border-b border-line hover:bg-[#FAF6FB]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-body text-sm text-ink-600">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-ink-900">
                      {log.user?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-ink-600">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-ink-600">
                      {log.entity}
                      {log.entityId ? ` #${log.entityId.toString()}` : ""}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-400">
                      {log.ip ? `${log.ip.slice(0, 12)}…` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line p-4 font-body text-sm text-ink-600">
          <span>
            Halaman {page} dari {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
}