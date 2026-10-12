import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ToastProvider } from "@/components/admin/toast";
import { requireUser } from "@/lib/auth/guards";

/**
 * Seluruh panel admin bersifat dinamis: setiap halaman bergantung pada sesi
 * login dan data yang berubah-ubah.
 *
 * Tanpa deklarasi ini Next.js mencoba memprerender halaman admin saat build
 * (termasuk form `/new`), padahal saat build tidak ada sesi. Hasilnya build
 * gagal acak dengan `Cannot read properties of null (reading 'useContext')`
 * atau `<Html> should not be imported outside of pages/_document` — halaman
 * yang gagal berbeda-beda tiap kali karena prerender berjalan paralel.
 */
export const dynamic = "force-dynamic";

/**
 * Layout panel admin (sidebar + topbar). Ditempatkan pada route group `(panel)`
 * sehingga `/admin/login` tetap tampil tanpa kerangka ini.
 *
 * `requireUser()` menegakkan autentikasi di server sebagai lapisan kedua
 * setelah middleware.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/admin");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-admin">
        <AdminSidebar role={user.role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar user={user} />
          <main className="mx-auto w-full max-w-[1280px] flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
