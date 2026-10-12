import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { ProductForm, type ProductFormInitial } from "../../product-form";
import { updateProductAction } from "../../actions";

export const metadata: Metadata = {
  title: "Ubah Produk",
  robots: { index: false, follow: false },
};

/** Formulir ubah produk (`/admin/products/[id]/edit`). */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/products");

  const { id } = await params;
  let productId: bigint;
  try {
    productId = BigInt(id);
  } catch {
    notFound();
  }

  const [product, categories, products] = await Promise.all([
    db.product.findUnique({
      where: { id: productId! },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          include: { media: { select: { path: true, fileName: true } } },
        },
        productTags: { include: { tag: { select: { name: true } } } },
        brochure: { select: { fileName: true } },
        relatedFrom: { select: { relatedProductId: true } },
      },
    }),
    db.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    db.product.findMany({
      orderBy: { name: "asc" },
      take: 200,
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  const specs = Array.isArray(product.specifications)
    ? (product.specifications as { key: string; value: string }[])
    : [];
  const apps = Array.isArray(product.applications)
    ? (product.applications as string[])
    : [];
  const primary = product.images.find((img) => img.isPrimary);

  const initial: ProductFormInitial = {
    name: product.name,
    categoryId: product.categoryId.toString(),
    shortDescription: product.shortDescription ?? "",
    status: product.status,
    sortOrder: product.sortOrder,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    brochureMediaId: product.brochureMediaId?.toString() ?? "",
    brochureName: product.brochure?.fileName,
    tagNames: product.productTags.map((t) => t.tag.name).join(", "),
    specifications: specs,
    applications: apps,
    imageIds: product.images.map((img) => img.mediaId.toString()),
    imagePreviews: product.images.map((img) => ({
      id: img.mediaId.toString(),
      path: img.media.path,
      fileName: img.media.fileName,
    })),
    primaryImageId: primary ? primary.mediaId.toString() : "",
    relatedIds: product.relatedFrom.map((r) => r.relatedProductId.toString()),
  };

  const action = updateProductAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produk", href: "/admin/products" },
          { label: "Ubah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">
        Ubah Produk: {product.name}
      </h1>
      <ProductForm
        action={action}
        categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
        relatedOptions={products
          .filter((p) => p.id !== product.id)
          .map((p) => ({ id: p.id.toString(), name: p.name }))}
        initial={initial}
      />
    </div>
  );
}
