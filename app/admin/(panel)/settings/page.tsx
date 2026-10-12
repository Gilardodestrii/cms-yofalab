import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Pengaturan Situs",
  robots: { index: false, follow: false },
};

/**
 * Halaman Pengaturan (`/admin/settings`). Hanya SUPER_ADMIN.
 * Form pengaturan lengkap dijadwalkan Sprint 7; Sprint 2 menegakkan RBAC +
 * menampilkan nilai pengaturan yang ada.
 */
export default async function AdminSettingsPage() {
  await requireRole(["SUPER_ADMIN"], "/admin/settings");

  const settings = await db.siteSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Pengaturan" }]}
      />
      <div className="panel-card p-4">
        <h1 className="font-heading text-lg font-semibold text-ink-900">
          Pengaturan Situs
        </h1>
        <p className="mt-1 font-body text-sm text-ink-600">
          Editor pengaturan lengkap tersedia pada Sprint 7.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {settings.map((setting) => (
          <div key={setting.key} className="panel-card p-4">
            <p className="font-heading text-sm font-semibold text-ink-900">
              {setting.key}
            </p>
            <pre className="mt-2 overflow-x-auto rounded-sm bg-surface-muted p-3 font-mono text-xs text-ink-600">
              {JSON.stringify(setting.value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}