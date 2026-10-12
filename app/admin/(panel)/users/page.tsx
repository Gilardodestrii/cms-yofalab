import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { roleLabels } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Pengguna",
  robots: { index: false, follow: false },
};

/**
 * Halaman Pengguna (`/admin/users`). Hanya SUPER_ADMIN.
 * CRUD penuh dijadwalkan Sprint 7; Sprint 2 menegakkan RBAC + daftar baca.
 */
export default async function AdminUsersPage() {
  await requireRole(["SUPER_ADMIN"], "/admin/users");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Pengguna" }]}
      />
      <div className="panel-card overflow-hidden">
        <div className="border-b border-line p-4">
          <h1 className="font-heading text-lg font-semibold text-ink-900">
            Pengguna Admin
          </h1>
          <p className="mt-1 font-body text-sm text-ink-600">
            Total {users.length} pengguna. Manajemen pengguna lengkap tersedia
            pada Sprint 7.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-brand-50">
                <th className="label-caps px-4 py-3" scope="col">
                  Nama
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  Email
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  Peran
                </th>
                <th className="label-caps px-4 py-3" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id.toString()} className="border-b border-line">
                  <td className="px-4 py-3 font-body text-sm text-ink-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-ink-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-ink-600">
                    {roleLabels[user.role]}
                  </td>
                  <td className="px-4 py-3 font-body text-sm">
                    <span
                      className={
                        user.isActive ? "text-success" : "text-ink-400"
                      }
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}