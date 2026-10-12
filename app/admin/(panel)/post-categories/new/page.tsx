import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { PostCategoryForm } from "../category-form";
import { createPostCategoryAction } from "../actions";

export const metadata: Metadata = {
  title: "Tambah Kategori Blog",
  robots: { index: false, follow: false },
};

/** Formulir tambah kategori blog. */
export default async function NewPostCategoryPage() {
  await requireRole(CONTENT_ROLES, "/admin/post-categories/new");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategori Blog", href: "/admin/post-categories" },
          { label: "Tambah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">Tambah Kategori Blog</h1>
      <PostCategoryForm action={createPostCategoryAction} />
    </div>
  );
}
