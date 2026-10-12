import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { CategoryForm } from "../../category-form";
import { updateCategoryAction } from "../../actions";

export const metadata: Metadata = {
  title: "Ubah Kategori",
  robots: { index: false, follow: false },
};

/** Formulir ubah kategori (`/admin/categories/[id]/edit`). */
export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/categories");

  const { id } = await params;
  let categoryId: bigint;
  try {
    categoryId = BigInt(id);
  } catch {
    notFound();
  }

  const category = await db.productCategory.findUnique({
    where: { id: categoryId! },
    include: { imageMedia: { select: { path: true, fileName: true } } },
  });
  if (!category) notFound();

  const action = updateCategoryAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategori", href: "/admin/categories" },
          { label: "Ubah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">
        Ubah Kategori: {category.name}
      </h1>
      <CategoryForm
        action={action}
        initial={{
          name: category.name,
          imageMediaId: category.imageMediaId?.toString() ?? "",
          imagePreview: category.imageMedia?.path,
          imageName: category.imageMedia?.fileName,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}
