"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";
import { postCategorySchema } from "@/lib/validators/blog";
import { slugify } from "@/lib/validators/catalog";

export type PostCategoryActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type AuthOk = { ok: true; userId: bigint };
type AuthFail = { ok: false; result: PostCategoryActionState };

async function ensureContentUser(): Promise<AuthOk | AuthFail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, result: { error: "Anda tidak berhak mengelola kategori blog." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

async function uniqueSlug(base: string, excludeId?: bigint): Promise<string> {
  const root = slugify(base).slice(0, 150) || "kategori";
  let slug = root;
  let n = 1;
  // ponytail: loop cek-unik per-sufiks; ganti ke transaksi bila bentrok tinggi.
  while (true) {
    const clash = await db.postCategory.findUnique({ where: { slug } });
    if (!clash || (excludeId !== undefined && clash.id === excludeId)) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

/** Buat kategori blog baru. */
export async function createPostCategoryAction(
  _prev: PostCategoryActionState,
  formData: FormData,
): Promise<PostCategoryActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  const parsed = postCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  const slug = await uniqueSlug(parsed.data.name);
  const created = await db.postCategory.create({
    data: { name: parsed.data.name.trim(), slug },
  });

  await recordActivity({
    userId: auth.userId,
    action: "create",
    entity: "post_category",
    entityId: created.id,
    meta: { name: created.name },
  });

  revalidatePath("/admin/post-categories");
  redirect("/admin/post-categories");
}

/** Ubah kategori blog. */
export async function updatePostCategoryAction(
  id: string,
  _prev: PostCategoryActionState,
  formData: FormData,
): Promise<PostCategoryActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  let categoryId: bigint;
  try {
    categoryId = BigInt(id);
  } catch {
    return { error: "ID kategori tidak valid." };
  }

  const parsed = postCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  const existing = await db.postCategory.findUnique({ where: { id: categoryId } });
  if (!existing) return { error: "Kategori tidak ditemukan." };

  const slug = await uniqueSlug(parsed.data.name, categoryId);
  await db.postCategory.update({
    where: { id: categoryId },
    data: { name: parsed.data.name.trim(), slug },
  });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "post_category",
    entityId: categoryId,
    meta: { name: parsed.data.name.trim() },
  });

  revalidatePath("/admin/post-categories");
  redirect("/admin/post-categories");
}

/** Hapus kategori blog (artikel ikut terlepas via SetNull). */
export async function deletePostCategoryAction(
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

  const existing = await db.postCategory.findUnique({ where: { id: categoryId } });
  if (!existing) return { ok: false, error: "Kategori tidak ditemukan." };

  await db.postCategory.delete({ where: { id: categoryId } });
  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "post_category",
    entityId: categoryId,
    meta: { name: existing.name },
  });

  revalidatePath("/admin/post-categories");
  return { ok: true };
}
