import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Masuk Panel Admin",
  robots: { index: false, follow: false },
};

/**
 * Halaman login admin (`/admin/login`).
 * Di luar grup layout admin sehingga tidak memakai sidebar/topbar.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-admin px-4">
      <div className="panel-card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold text-ink-900">
          {siteConfig.name}
        </h1>
        <p className="mb-6 mt-1 font-body text-sm text-ink-600">
          Masuk ke panel admin untuk mengelola konten.
        </p>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}