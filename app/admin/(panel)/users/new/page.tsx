import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { UserForm } from "../user-form";
import { createUserAction } from "../actions";

export const metadata: Metadata = {
  title: "Tambah Pengguna",
  robots: { index: false, follow: false },
};

/** Formulir tambah pengguna. */
export default async function NewUserPage() {
  await requireRole(["SUPER_ADMIN"], "/admin/users/new");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pengguna", href: "/admin/users" },
          { label: "Tambah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">Tambah Pengguna</h1>
      <UserForm action={createUserAction} />
    </div>
  );
}
