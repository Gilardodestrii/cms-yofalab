"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { sanitizeHtml } from "@/lib/sanitize";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";
import { postSchema } from "@/lib/validators/blog";
import { slugify } from "@/lib/validators/catalog";

export type PostActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type AuthOk = { ok: true; userId: bigint };
type AuthFail = { ok: false; result: PostActionState };

async function ensureContentUser(): Promise<AuthOk | AuthFail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, result: { error: "Anda tidak berhak mengelola artikel." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

async function uniqueSlug(base: string, excludeId?: bigint): Promise<string> {
  const root = slugify(base).slice(0, 200) || "artikel";
  let slug = root;
  let n = 1;
  // ponytail: loop cek-unik per-sufiks; ganti ke transaksi bila bentrok tinggi.
  while (true) {
    const clash = await db.post.findUnique({ where: { slug } });
    if (!clash || (excludeId !== undefined && clash.id === excludeId)) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

function parseBigId(value: unknown): bigint | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return BigInt(value.trim());
  } catch {
    return null;
  }
}

/**
 * Parse input `datetime-local` (YYYY-MM-DDTHH:mm). Kembalikan null bila kosong/tak valid.
 * Status PUBLISHED + tanggal kosong → sekarang; DRAFT + kosong → null.
 */
function parsePublishedAt(raw: string, status: "DRAFT" | "PUBLISHED"): Date | null {
  const clean = raw.trim();
  if (!clean) return status === "PUBLISHED" ? new Date() : null;
  const d = new Date(clean);
  return Number.isNaN(d.getTime()) ? null : d;
}

function nullIfEmpty(value: string): string | null {
  const clean = value.trim();
  return clean ? clean : null;
}

/** Validasi relasi kategori + cover media; kembalikan error string atau null. */
async function validateRelations(categoryId: bigint | null, coverMediaId: bigint | null): Promise<string | null> {
  if (categoryId !== null) {
    const cat = await db.postCategory.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!cat) return "Kategori tidak ditemukan.";
  }
  if (coverMediaId !== null) {
    const media = await db.media.findUnique({ where: { id: coverMediaId }, select: { id: true, mimeType: true } });
    if (!media) return "Gambar utama tidak ditemukan.";
    if (!media.mimeType.startsWith("image/")) return "Gambar utama harus berupa gambar.";
  }
  return null;
}

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "title");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

/** Buat artikel baru (penulis = pengguna aktif). */
export async function createPostAction(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverMediaId: formData.get("coverMediaId"),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const categoryId = parseBigId(data.categoryId);
  if (data.categoryId.trim() && categoryId === null) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { categoryId: "Kategori tidak valid." } };
  }
  const coverMediaId = parseBigId(data.coverMediaId);
  if (data.coverMediaId.trim() && coverMediaId === null) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { coverMediaId: "Gambar utama tidak valid." } };
  }

  const relationError = await validateRelations(categoryId, coverMediaId);
  if (relationError) return { error: relationError };

  const slug = await uniqueSlug(data.title);
  const content = sanitizeHtml(data.content);
  const publishedAt = parsePublishedAt(data.publishedAt, data.status);

  const created = await db.post.create({
    data: {
      title: data.title.trim(),
      slug,
      categoryId,
      authorId: auth.userId,
      excerpt: nullIfEmpty(data.excerpt),
      content,
      coverMediaId,
      status: data.status,
      publishedAt,
      seoTitle: nullIfEmpty(data.seoTitle),
      seoDescription: nullIfEmpty(data.seoDescription),
    },
  });

  await recordActivity({
    userId: auth.userId,
    action: "create",
    entity: "post",
    entityId: created.id,
    meta: { title: created.title },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

/** Ubah artikel (penulis asli dipertahankan). */
export async function updatePostAction(
  id: string,
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  let postId: bigint;
  try {
    postId = BigInt(id);
  } catch {
    return { error: "ID artikel tidak valid." };
  }

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverMediaId: formData.get("coverMediaId"),
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const existing = await db.post.findUnique({ where: { id: postId } });
  if (!existing) return { error: "Artikel tidak ditemukan." };

  const categoryId = parseBigId(data.categoryId);
  if (data.categoryId.trim() && categoryId === null) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { categoryId: "Kategori tidak valid." } };
  }
  const coverMediaId = parseBigId(data.coverMediaId);
  if (data.coverMediaId.trim() && coverMediaId === null) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { coverMediaId: "Gambar utama tidak valid." } };
  }

  const relationError = await validateRelations(categoryId, coverMediaId);
  if (relationError) return { error: relationError };

  const slug = await uniqueSlug(data.title, postId);
  const content = sanitizeHtml(data.content);
  const publishedAt = parsePublishedAt(data.publishedAt, data.status);

  await db.post.update({
    where: { id: postId },
    data: {
      title: data.title.trim(),
      slug,
      categoryId,
      excerpt: nullIfEmpty(data.excerpt),
      content,
      coverMediaId,
      status: data.status,
      publishedAt,
      seoTitle: nullIfEmpty(data.seoTitle),
      seoDescription: nullIfEmpty(data.seoDescription),
    },
  });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "post",
    entityId: postId,
    meta: { title: data.title.trim() },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

/** Hapus artikel (komentar ikut terhapus via Cascade). */
export async function deletePostAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await ensureContentUser();
  if (!auth.ok) return { ok: false, error: auth.result.error ?? "Tidak berhak." };

  let postId: bigint;
  try {
    postId = BigInt(id);
  } catch {
    return { ok: false, error: "ID artikel tidak valid." };
  }

  const existing = await db.post.findUnique({ where: { id: postId } });
  if (!existing) return { ok: false, error: "Artikel tidak ditemukan." };

  await db.post.delete({ where: { id: postId } });
  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "post",
    entityId: postId,
    meta: { title: existing.title },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  return { ok: true };
}
