"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ToastProvider } from "@/components/admin/toast";
import type { SessionUser } from "@/lib/auth/guards";

/**
 * Kerangka panel admin: sidebar + topbar + isi halaman.
 *
 * Status laci mobile (`open`) diangkat ke komponen ini karena tombol
 * pembukanya berada di dalam topbar (yang `sticky`), sedangkan lacinya bagian
 * dari sidebar — dua subkomponen terpisah yang perlu berbagi satu status.
 *
 * Topbar dibuat `sticky top-0`, sehingga tombol menu tetap terlihat saat
 * halaman digulir dan bergerak menyatu dengan header. Sebelumnya tombol
 * memakai `fixed`, jadi ia terpaku pada viewport dan tertinggal saat header
 * naik — itu bug yang dilaporkan.
 *
 * Root dikunci ke tinggi viewport (`h-screen overflow-hidden`) dan setiap
 * area punya track gulirnya sendiri: sidebar `overflow-y-auto`, isi halaman
 * `overflow-y-auto`. Sebelumnya root memakai `min-h-screen` sehingga yang
 * menggulir adalah dokumen — sidebar tanpa tinggi sendiri ikut terangkat.
 *
 * `children` diteruskan apa adanya dari server component sehingga halaman
 * admin tetap dirender di server.
 */
export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-surface-admin">
        <AdminSidebar role={user.role} open={open} onOpenChange={setOpen} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopbar user={user} onOpenMenu={() => setOpen(true)} />
          <main className="mx-auto w-full max-w-[1280px] flex-1 overflow-y-auto overscroll-y-contain p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
