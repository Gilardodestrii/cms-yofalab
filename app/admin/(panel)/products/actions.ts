"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";
import {
  productApplicationsSchema,
  productSchema,
  productSpecificationsSchema,
  slugify,
} from "@/lib/validators/catalog";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type DeleteProductResult =
  | { ok: true; soft: boolean }
  | { ok: false; error: string };

type AuthOk = { ok: true; userId: bigint };
type AuthFail = { ok: false; result: ProductActionState };

async function ensureContentUser(): Promise<AuthOk | AuthFail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, result: { error: "Anda tidak berhak mengelola produk." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

function parseBigId(value: string): bigint | null {
  const clean = value.trim();
  if (!clean) return null;
  try {
    return BigInt(clean);
  } catch {
    return null;
  }
}

function parseIdList(value: FormDataEntryValue | null): bigint[] {
  if (typeof value !== "string" || !value.trim()) return [];
  const out: bigint[] = [];
  for (const part of value.split(",")) {
    const id = parseBigId(part);
    if (id !== null && !out.includes(id)) out.push(id);
  }
  return out;
}

function nullIfEmpty(value: string): string | null {
  const clean = value.trim();
  return clean ? clean : null;
}

/** Pecah string koma jadi daftar nama tag unik (maks 20, tiap 100 char). */
function parseTagNames(value: string): string[] {
  const seen = new Set<string>();
  for (const part of value.split(",")) {
    const name = part.trim().replace(/\s+/g, " ");
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    if (seen.size >= 20) break;
  }
  return [...seen].map(
    (lower) =>
      value
        .split(",")
        .map((p) => p.trim().replace(/\s+/g, " "))
        .find((p) => p.toLowerCase() === lower) ?? lower,
  );
}

async function uniqueSlug(base: string, excludeId?: bigint): Promise<string> {
  const root = slugify(base) || "produk";
  let slug = root;
  let n = 1;
  // ponytail: loop cek-unik per-sufiks; ganti ke transaksi bila bentrok tinggi.
  while (true) {
    const clash = await db.product.findUnique({ where: { slug } });
    if (!clash || (excludeId !== undefined && clash.id === excludeId)) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

function fieldErrorsOf(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "name");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

type ParsedProductForm =
  | { ok: true; data: ParsedProductData }
  | { ok: false; result: ProductActionState };

type ParsedProductData = {
  name: string;
  categoryId: bigint;
  shortDescription: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  brochureMediaId: bigint | null;
  tagNames: string[];
  specifications: { key: string; value: string }[];
  applications: string[];
  imageIds: bigint[];
  primaryImageId: bigint | null;
  relatedIds: bigint[];
};

async function parseProductForm(formData: FormData): Promise<ParsedProductForm> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription") ?? "",
    status: formData.get("status") ?? "DRAFT",
    sortOrder: formData.get("sortOrder"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    brochureMediaId: formData.get("brochureMediaId") ?? "",
    tags: formData.get("tags") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      result: {
        error: "Periksa kembali isian formulir.",
        fieldErrors: fieldErrorsOf(parsed.error),
      },
    };
  }
  const data = parsed.data;

  const categoryId = parseBigId(data.categoryId);
  if (categoryId === null) {
    return {
      ok: false,
      result: { error: "Periksa kembali isian formulir.", fieldErrors: { categoryId: "Kategori tidak valid." } },
    };
  }

  let specs: { key: string; value: string }[] = [];
  let apps: string[] = [];
  try {
    specs = productSpecificationsSchema.parse(
      JSON.parse(String(formData.get("specifications") ?? "[]")),
    );
    apps = productApplicationsSchema.parse(
      JSON.parse(String(formData.get("applications") ?? "[]")),
    );
  } catch {
    return {
      ok: false,
      result: {
        error: "Periksa kembali isian formulir.",
        fieldErrors: { specifications: "Spesifikasi/aplikasi tidak valid." },
      },
    };
  }

  const imageIds = parseIdList(formData.get("imageIds"));
  const primaryRaw = formData.get("primaryImageId");
  const primaryImageId =
    typeof primaryRaw === "string" && primaryRaw.trim() ? parseBigId(primaryRaw) : null;
  if (typeof primaryRaw === "string" && primaryRaw.trim() && primaryImageId === null) {
    return {
      ok: false,
      result: { error: "Gambar utama tidak valid." },
    };
  }
  if (primaryImageId !== null && !imageIds.includes(primaryImageId)) {
    return {
      ok: false,
      result: { error: "Gambar utama harus salah satu galeri." },
    };
  }

  const brochureMediaId = data.brochureMediaId.trim()
    ? parseBigId(data.brochureMediaId)
    : null;
  if (data.brochureMediaId.trim() && brochureMediaId === null) {
    return { ok: false, result: { error: "Media brosur tidak valid." } };
  }

  const relatedIds = parseIdList(formData.get("relatedIds"));

  // Validasi keberadaan: kategori, media galeri+brosur, produk terkait.
  const category = await db.productCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return {
      ok: false,
      result: { error: "Periksa kembali isian formulir.", fieldErrors: { categoryId: "Kategori tidak ditemukan." } },
    };
  }
  if (imageIds.length > 0) {
    const found = await db.media.count({ where: { id: { in: imageIds } } });
    if (found !== imageIds.length) {
      return { ok: false, result: { error: "Salah satu gambar galeri tidak ditemukan." } };
    }
  }
  if (brochureMediaId !== null) {
    const brochure = await db.media.findUnique({ where: { id: brochureMediaId } });
    if (!brochure) return { ok: false, result: { error: "Media brosur tidak ditemukan." } };
  }
  if (relatedIds.length > 0) {
    const found = await db.product.count({ where: { id: { in: relatedIds } } });
    if (found !== relatedIds.length) {
      return { ok: false, result: { error: "Salah satu produk terkait tidak ditemukan." } };
    }
  }

  return {
    ok: true,
    data: {
      name: data.name.trim(),
      categoryId,
      shortDescription: nullIfEmpty(data.shortDescription),
      status: data.status,
      sortOrder: data.sortOrder,
      seoTitle: nullIfEmpty(data.seoTitle),
      seoDescription: nullIfEmpty(data.seoDescription),
      brochureMediaId,
      tagNames: parseTagNames(data.tags),
      specifications: specs,
      applications: apps,
      imageIds,
      primaryImageId,
      relatedIds,
    },
  };
}

/** Pastikan tag ada (buat bila belum), kembalikan id-nya. */
async function ensureTagIds(tx: Prisma.TransactionClient, names: string[]): Promise<bigint[]> {
  const ids: bigint[] = [];
  for (const name of names) {
    const slug = slugify(name) || `tag-${Date.now()}`;
    let tag = await tx.tag.findFirst({ where: { slug } });
    if (!tag || tag.name.toLowerCase() !== name.toLowerCase()) {
      tag = await tx.tag.findFirst({
        where: { name: { equals: name } },
      });
    }
    if (!tag) {
      const tagSlug = await (async () => {
        let s = slug;
        let n = 1;
        while (await tx.tag.findUnique({ where: { slug: s } })) {
          n += 1;
          s = `${slug}-${n}`;
        }
        return s;
      })();
      tag = await tx.tag.create({ data: { name, slug: tagSlug } });
    }
    ids.push(tag.id);
  }
  return ids;
}

/** Buat produk baru. Dipanggil dari form `/admin/products/new`. */
export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  const parsed = await parseProductForm(formData);
  if (!parsed.ok) return parsed.result;
  const d = parsed.data;

  const slug = await uniqueSlug(d.name);
  const created = await db.$transaction(async (tx) => {
    const tagIds = await ensureTagIds(tx, d.tagNames);
    const product = await tx.product.create({
      data: {
        categoryId: d.categoryId,
        name: d.name,
        slug,
        shortDescription: d.shortDescription,
        specifications: d.specifications.length > 0 ? d.specifications : undefined,
        applications: d.applications.length > 0 ? d.applications : undefined,
        brochureMediaId: d.brochureMediaId,
        status: d.status,
        sortOrder: d.sortOrder,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
      },
    });
    if (d.imageIds.length > 0) {
      await tx.productImage.createMany({
        data: d.imageIds.map((mediaId, i) => ({
          productId: product.id,
          mediaId,
          isPrimary: d.primaryImageId !== null ? mediaId === d.primaryImageId : i === 0,
          sortOrder: i,
        })),
      });
    }
    if (tagIds.length > 0) {
      await tx.productTag.createMany({
        data: tagIds.map((tagId) => ({ productId: product.id, tagId })),
      });
    }
    const related = d.relatedIds.filter((id) => id !== product.id);
    if (related.length > 0) {
      await tx.productRelated.createMany({
        data: related.map((relatedProductId, i) => ({
          productId: product.id,
          relatedProductId,
          sortOrder: i,
        })),
      });
    }
    return product;
  });

  await recordActivity({
    userId: auth.userId,
    action: "create",
    entity: "product",
    entityId: created.id,
    meta: { name: created.name },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  redirect("/admin/products");
}

/** Ubah produk. Dipanggil dari form `/admin/products/[id]/edit`. */
export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  let productId: bigint;
  try {
    productId = BigInt(id);
  } catch {
    return { error: "ID produk tidak valid." };
  }

  const existing = await db.product.findUnique({ where: { id: productId } });
  if (!existing) return { error: "Produk tidak ditemukan." };

  const parsed = await parseProductForm(formData);
  if (!parsed.ok) return parsed.result;
  const d = parsed.data;

  if (d.relatedIds.includes(productId)) {
    return { error: "Produk tidak bisa terkait dengan dirinya sendiri." };
  }

  const slug = await uniqueSlug(d.name, productId);
  await db.$transaction(async (tx) => {
    const tagIds = await ensureTagIds(tx, d.tagNames);
    await tx.product.update({
      where: { id: productId },
      data: {
        categoryId: d.categoryId,
        name: d.name,
        slug,
        shortDescription: d.shortDescription,
        specifications: d.specifications.length > 0 ? d.specifications : Prisma.JsonNull,
        applications: d.applications.length > 0 ? d.applications : Prisma.JsonNull,
        brochureMediaId: d.brochureMediaId,
        status: d.status,
        sortOrder: d.sortOrder,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
      },
    });
    await tx.productImage.deleteMany({ where: { productId } });
    if (d.imageIds.length > 0) {
      await tx.productImage.createMany({
        data: d.imageIds.map((mediaId, i) => ({
          productId,
          mediaId,
          isPrimary: d.primaryImageId !== null ? mediaId === d.primaryImageId : i === 0,
          sortOrder: i,
        })),
      });
    }
    await tx.productTag.deleteMany({ where: { productId } });
    if (tagIds.length > 0) {
      await tx.productTag.createMany({
        data: tagIds.map((tagId) => ({ productId, tagId })),
      });
    }
    await tx.productRelated.deleteMany({ where: { productId } });
    const related = d.relatedIds.filter((rid) => rid !== productId);
    if (related.length > 0) {
      await tx.productRelated.createMany({
        data: related.map((relatedProductId, i) => ({
          productId,
          relatedProductId,
          sortOrder: i,
        })),
      });
    }
  });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "product",
    entityId: productId,
    meta: { name: d.name },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  redirect("/admin/products");
}

/**
 * Hapus produk: soft delete (ARCHIVED) bila masih punya gambar/tag/relasi,
 * hard delete bila sudah kosong.
 */
export async function deleteProductAction(id: string): Promise<DeleteProductResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, error: "Anda tidak berhak mengelola produk." };
  }

  let productId: bigint;
  try {
    productId = BigInt(id);
  } catch {
    return { ok: false, error: "ID produk tidak valid." };
  }

  const existing = await db.product.findUnique({
    where: { id: productId },
    include: {
      _count: {
        select: { images: true, productTags: true, relatedFrom: true, relatedTo: true },
      },
    },
  });
  if (!existing) return { ok: false, error: "Produk tidak ditemukan." };

  const hasRelations =
    existing._count.images > 0 ||
    existing._count.productTags > 0 ||
    existing._count.relatedFrom > 0 ||
    existing._count.relatedTo > 0;

  if (hasRelations) {
    await db.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
    await recordActivity({
      userId: BigInt(user.id),
      action: "delete",
      entity: "product",
      entityId: productId,
      meta: { name: existing.name, soft: true },
    });
    revalidatePath("/admin/products");
    return { ok: true, soft: true };
  }

  await db.product.delete({ where: { id: productId } });
  await recordActivity({
    userId: BigInt(user.id),
    action: "delete",
    entity: "product",
    entityId: productId,
    meta: { name: existing.name, soft: false },
  });
  revalidatePath("/admin/products");
  return { ok: true, soft: false };
}
