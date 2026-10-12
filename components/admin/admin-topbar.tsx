import { logoutAction } from "@/app/admin/actions";
import { roleLabels } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/guards";

/**
 * Topbar admin: tinggi 64 px, latar putih, garis bawah 1 px.
 * Menampilkan breadcrumb (slot), nama pengguna + peran, dan tombol keluar.
 */
export function AdminTopbar({
  user,
  breadcrumb,
}: {
  user: SessionUser;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 pl-16 lg:px-6 lg:pl-6">
      <div className="min-w-0">{breadcrumb}</div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="truncate font-heading text-sm font-semibold text-ink-900">
            {user.name ?? user.email}
          </p>
          <p className="font-body text-xs text-ink-400">
            {roleLabels[user.role]}
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn-admin-secondary">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}