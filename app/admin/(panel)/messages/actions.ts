"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { ADMIN_BASE_ROLES, hasRole } from "@/lib/auth/roles";

export type MessageActionState = {
  ok?: boolean;
  error?: string;
};

/** Semua peran admin boleh menangani pesan (CS menandai status + catatan). */
async function ensureAdminUser(): Promise<
  { ok: true; userId: bigint } | { ok: false; result: MessageActionState }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, ADMIN_BASE_ROLES)) {
    return { ok: false, result: { error: "Anda tidak berhak mengelola pesan." } };
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

/** Ubah status pesan (NEW / READ / FOLLOWED_UP). */
export async function setMessageStatusAction(
  id: string,
  status: "NEW" | "READ" | "FOLLOWED_UP",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await ensureAdminUser();
  if (!auth.ok) return { ok: false, error: auth.result.error ?? "Tidak berhak." };

  const messageId = parseId(id);
  if (messageId === null) return { ok: false, error: "ID pesan tidak valid." };

  const existing = await db.contactMessage.findUnique({ where: { id: messageId }, select: { id: true } });
  if (!existing) return { ok: false, error: "Pesan tidak ditemukan." };

  await db.contactMessage.update({ where: { id: messageId }, data: { status } });
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "contact_message",
    entityId: messageId,
    meta: { status },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  return { ok: true };
}

/** Simpan catatan internal pesan. */
export async function saveMessageNoteAction(
  id: string,
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const auth = await ensureAdminUser();
  if (!auth.ok) return auth.result;

  const messageId = parseId(id);
  if (messageId === null) return { error: "ID pesan tidak valid." };

  const raw = formData.get("internalNote");
  const note = typeof raw === "string" ? raw.trim().slice(0, 5000) : "";

  const existing = await db.contactMessage.findUnique({ where: { id: messageId }, select: { id: true } });
  if (!existing) return { error: "Pesan tidak ditemukan." };

  await db.contactMessage.update({
    where: { id: messageId },
    data: { internalNote: note || null },
  });
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "contact_message",
    entityId: messageId,
    meta: { noteSaved: true },
  });

  revalidatePath(`/admin/messages/${id}`);
  return { ok: true };
}

/** Hapus pesan kontak. */
export async function deleteMessageAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await ensureAdminUser();
  if (!auth.ok) return { ok: false, error: auth.result.error ?? "Tidak berhak." };

  const messageId = parseId(id);
  if (messageId === null) return { ok: false, error: "ID pesan tidak valid." };

  const existing = await db.contactMessage.findUnique({ where: { id: messageId }, select: { id: true } });
  if (!existing) return { ok: false, error: "Pesan tidak ditemukan." };

  await db.contactMessage.delete({ where: { id: messageId } });
  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "contact_message",
    entityId: messageId,
  });

  revalidatePath("/admin/messages");
  return { ok: true };
}
