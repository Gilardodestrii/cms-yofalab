import { logoutAction } from "@/app/admin/actions";
import { roleLabels } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/guards";

/**
 * Topbar admin: tinggi 64 px, latar putih, garis bawah 1 px.
 * Menampilkan tombol menu (mobile), breadcrumb, nama pengguna + peran, dan
 * tombol keluar.
 *
 * `sticky top-0`: header tetap menempel di atas saat halaman digulir, dan
 * tombol menu berada DI DALAM header sehingga keduanya bergerak menyatu.
 * Sebelumnya tombol menu memakai `fixed` di komponen sidebar, sehingga ia
 * terpaku pada viewport dan tertinggal ketika header menggulir naik.
 */
export function AdminTopbar({
  user,
  breadcrumb,
  onOpenMenu,
}: {
  user: SessionUser;
  breadcrumb?: React.ReactNode;
  onOpenMenu?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu"
          aria-controls="admin-sidebar"
          className="btn-admin-secondary shrink-0 lg:hidden"
        >
          ☰
        </button>
        <div className="min-w-0">{breadcrumb}</div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
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
