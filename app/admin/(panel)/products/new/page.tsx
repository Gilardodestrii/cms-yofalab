import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export const metadata: Metadata = {
  title: "Tambah Produk",
  robots: { index: false, follow: false },
};

/** Formulir tambah produk (`/admin/products/new`). */
export default async function NewProductPage() {
  await requireRole(CONTENT_ROLES, "/admin/products/new");

  const [categories, products] = await Promise.all([
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

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produk", href: "/admin/products" },
          { label: "Tambah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">
        Tambah Produk
      </h1>
      {categories.length === 0 ? (
        <p className="panel-card p-6 font-body text-sm text-ink-600">
          Buat kategori dulu di /admin/categories sebelum menambah produk.
        </p>
      ) : (
        <ProductForm
          action={createProductAction}
          categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
          relatedOptions={products.map((p) => ({ id: p.id.toString(), name: p.name }))}
        />
      )}
    </div>
  );
}
