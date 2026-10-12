import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Akses Ditolak",
  robots: { index: false, follow: false },
};

/** Halaman 403: peran pengguna tidak berhak mengakses rute ini. */
export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-admin px-4 text-center">
      <p className="font-heading text-6xl font-bold text-brand-600">403</p>
      <h1 className="mt-4 text-xl font-semibold text-ink-900">
        Akses ditolak
      </h1>
      <p className="mt-2 max-w-sm font-body text-sm text-ink-600">
        Peran akun Anda tidak memiliki izin untuk membuka halaman ini.
      </p>
      <div className="mt-6">
        <ButtonLink href="/admin" variant="primary">
          Kembali ke Dashboard
        </ButtonLink>
      </div>
    </main>
  );
}