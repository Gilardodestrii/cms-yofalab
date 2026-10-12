import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { UserForm } from "../../user-form";
import { updateUserAction } from "../../actions";

export const metadata: Metadata = {
  title: "Ubah Pengguna",
  robots: { index: false, follow: false },
};

/** Formulir ubah pengguna (termasuk reset kata sandi). */
export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["SUPER_ADMIN"], "/admin/users");

  const { id } = await params;
  let userId: bigint;
  try {
    userId = BigInt(id);
  } catch {
    notFound();
  }

  const user = await db.user.findUnique({
    where: { id: userId! },
    select: { name: true, email: true, role: true, isActive: true },
  });
  if (!user) notFound();

  const action = updateUserAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pengguna", href: "/admin/users" },
          { label: "Ubah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">Ubah Pengguna: {user.name}</h1>
      <UserForm
        action={action}
        initial={{ name: user.name, email: user.email, role: user.role, isActive: user.isActive }}
      />
    </div>
  );
}
