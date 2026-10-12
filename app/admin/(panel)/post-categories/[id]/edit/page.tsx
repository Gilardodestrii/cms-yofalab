import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { PostCategoryForm } from "../../category-form";
import { updatePostCategoryAction } from "../../actions";

export const metadata: Metadata = {
  title: "Ubah Kategori Blog",
  robots: { index: false, follow: false },
};

/** Formulir ubah kategori blog. */
export default async function EditPostCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/post-categories");

  const { id } = await params;
  let categoryId: bigint;
  try {
    categoryId = BigInt(id);
  } catch {
    notFound();
  }

  const category = await db.postCategory.findUnique({ where: { id: categoryId! } });
  if (!category) notFound();

  const action = updatePostCategoryAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategori Blog", href: "/admin/post-categories" },
          { label: "Ubah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">
        Ubah Kategori: {category.name}
      </h1>
      <PostCategoryForm action={action} initial={{ name: category.name }} />
    </div>
  );
}
