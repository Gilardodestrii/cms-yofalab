"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";
import {
  productCategorySchema,
  slugify,
} from "@/lib/validators/catalog";

export type CategoryActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type AuthOk = { ok: true; userId: bigint };
type AuthFail = { ok: false; result: CategoryActionState };

async function ensureContentUser(): Promise<AuthOk | AuthFail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, result: { error: "Anda tidak berhak mengelola kategori." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

function parseMediaId(value: string): bigint | null {
  const clean = value.trim();
  if (!clean) return null;
  try {
    return BigInt(clean);
  } catch {
    return null;
  }
}

async function uniqueSlug(base: string, excludeId?: bigint): Promise<string> {
  const root = slugify(base) || "kategori";
  let slug = root;
  let n = 1;
  // ponytail: loop cek-unik per-sufiks; ganti ke transaksi bila bentrok tinggi.
  while (true) {
    const clash = await db.productCategory.findUnique({ where: { slug } });
    if (!clash || (excludeId !== undefined && clash.id === excludeId)) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

/** Buat kategori baru. Dipanggil dari form `/admin/categories/new`. */
export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  const parsed = productCategorySchema.safeParse({
    name: formData.get("name"),
    imageMediaId: formData.get("imageMediaId"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  const imageMediaId = parseMediaId(parsed.data.imageMediaId);
  if (parsed.data.imageMediaId.trim() && imageMediaId === null) {
    return { error: "Media gambar tidak valid." };
  }
  if (imageMediaId !== null) {
    const media = await db.media.findUnique({ where: { id: imageMediaId } });
    if (!media) return { error: "Media gambar tidak ditemukan." };
  }

  const slug = await uniqueSlug(parsed.data.name);
  const created = await db.productCategory.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      imageMediaId,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await recordActivity({
    userId: auth.userId,
    action: "create",
    entity: "product_category",
    entityId: created.id,
    meta: { name: created.name },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

/** Ubah kategori. Dipanggil dari form `/admin/categories/[id]/edit`. */
export async function updateCategoryAction(
  id: string,
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  let categoryId: bigint;
  try {
    categoryId = BigInt(id);
  } catch {
    return { error: "ID kategori tidak valid." };
  }

  const parsed = productCategorySchema.safeParse({
    name: formData.get("name"),
    imageMediaId: formData.get("imageMediaId"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  const existing = await db.productCategory.findUnique({ where: { id: categoryId } });
  if (!existing) return { error: "Kategori tidak ditemukan." };

  const imageMediaId = parseMediaId(parsed.data.imageMediaId);
  if (parsed.data.imageMediaId.trim() && imageMediaId === null) {
    return { error: "Media gambar tidak valid." };
  }

  const slug = await uniqueSlug(parsed.data.name, categoryId);
  await db.productCategory.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name.trim(),
      slug,
      imageMediaId,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "product_category",
    entityId: categoryId,
    meta: { name: parsed.data.name.trim() },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

/**
 * Hapus kategori. Kategori yang masih dipakai produk ditolak
 * (hard delete hanya bila aman).
 */
export async function deleteCategoryAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await ensureContentUser();
  if (!auth.ok) return { ok: false, error: auth.result.error ?? "Tidak berhak." };

  let categoryId: bigint;
  try {
    categoryId = BigInt(id);
  } catch {
    return { ok: false, error: "ID kategori tidak valid." };
  }

  const used = await db.product.count({ where: { categoryId } });
  if (used > 0) {
    return {
      ok: false,
      error: `Kategori dipakai ${used} produk; pindahkan dulu produknya.`,
    };
  }

  const existing = await db.productCategory.findUnique({ where: { id: categoryId } });
  if (!existing) return { ok: false, error: "Kategori tidak ditemukan." };

  await db.productCategory.delete({ where: { id: categoryId } });
  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "product_category",
    entityId: categoryId,
    meta: { name: existing.name },
  });

  revalidatePath("/admin/categories");
  return { ok: true };
}
