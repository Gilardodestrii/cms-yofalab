import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CategoryForm } from "../category-form";
import { createCategoryAction } from "../actions";

export const metadata: Metadata = {
  title: "Tambah Kategori",
  robots: { index: false, follow: false },
};

/** Formulir tambah kategori (`/admin/categories/new`). */
export default async function NewCategoryPage() {
  await requireRole(CONTENT_ROLES, "/admin/categories/new");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategori", href: "/admin/categories" },
          { label: "Tambah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">
        Tambah Kategori
      </h1>
      <CategoryForm action={createCategoryAction} />
    </div>
  );
}
