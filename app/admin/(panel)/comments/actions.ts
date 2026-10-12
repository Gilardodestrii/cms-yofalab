"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";

export type CommentActionResult = { ok: true } | { ok: false; error: string };

async function ensureContentUser(): Promise<
  { ok: true; userId: bigint } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, error: "Anda tidak berhak memoderasi komentar." };
  }
  return { ok: true, userId: BigInt(user.id) };
}

function parseId(id: string): bigint | null {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

/** Ubah status komentar (APPROVED / PENDING / SPAM). */
export async function setCommentStatusAction(
  id: string,
  status: "APPROVED" | "PENDING" | "SPAM",
): Promise<CommentActionResult> {
  const auth = await ensureContentUser();
  if (!auth.ok) return { ok: false, error: auth.error };

  const commentId = parseId(id);
  if (commentId === null) return { ok: false, error: "ID komentar tidak valid." };

  const existing = await db.comment.findUnique({
    where: { id: commentId },
    select: { id: true, post: { select: { slug: true } } },
  });
  if (!existing) return { ok: false, error: "Komentar tidak ditemukan." };

  await db.comment.update({ where: { id: commentId }, data: { status } });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "comment",
    entityId: commentId,
    meta: { status },
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/blog/${existing.post.slug}`);
  return { ok: true };
}

/** Hapus komentar permanen. */
export async function deleteCommentAction(id: string): Promise<CommentActionResult> {
  const auth = await ensureContentUser();
  if (!auth.ok) return { ok: false, error: auth.error };

  const commentId = parseId(id);
  if (commentId === null) return { ok: false, error: "ID komentar tidak valid." };

  const existing = await db.comment.findUnique({
    where: { id: commentId },
    select: { id: true, post: { select: { slug: true } } },
  });
  if (!existing) return { ok: false, error: "Komentar tidak ditemukan." };

  await db.comment.delete({ where: { id: commentId } });

  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "comment",
    entityId: commentId,
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/blog/${existing.post.slug}`);
  return { ok: true };
}
