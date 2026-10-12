import { AdminShell } from "@/components/admin/admin-shell";
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
 * Kerangka visualnya ada di `AdminShell` (komponen klien) karena status laci
 * mobile perlu dibagi antara topbar dan sidebar. `children` tetap dirender di
 * server, jadi isi halaman tidak ikut menjadi bundle klien.
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

  return <AdminShell user={user}>{children}</AdminShell>;
}
