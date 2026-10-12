"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getClientIp } from "@/lib/request";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";
import { saveUpload } from "@/lib/upload";
import { headers } from "next/headers";

export type MediaActionResult =
  | { ok: true; id?: string; url?: string }
  | { ok: false; error: string };

/** Pastikan pengguna boleh mengelola media; kembalikan id atau error. */
async function ensureContentUser(): Promise<
  { ok: true; userId: bigint } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Tidak terautentikasi." };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, error: "Anda tidak berhak mengelola media." };
  }
  return { ok: true, userId: BigInt(user.id) };
}

/**
 * Unggah satu berkas media. Memvalidasi tipe/ukuran di server, menyimpan ke
 * disk, lalu mencatat baris `media` dan log aktivitas.
 */
export async function uploadMediaAction(
  formData: FormData,
): Promise<MediaActionResult> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth;

  const file = formData.get("file");
  const altText = (formData.get("altText") ?? "").toString().trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Pilih berkas terlebih dahulu." };
  }

  const saved = await saveUpload(file);
  if (!saved.ok) return saved;

  const media = await db.media.create({
    data: {
      fileName: saved.file.fileName,
      path: saved.file.path,
      mimeType: saved.file.mimeType,
      size: saved.file.size,
      width: saved.file.width,
      height: saved.file.height,
      altText,
      uploadedBy: auth.userId,
    },
  });

  const requestHeaders = await headers();
  await recordActivity({
    userId: auth.userId,
    action: "upload",
    entity: "media",
    entityId: media.id,
    meta: { fileName: media.fileName },
    ip: getClientIp(requestHeaders),
  });

  revalidatePath("/admin/media");
  return { ok: true, id: media.id.toString(), url: media.path };
}

/** Ganti nama berkas (hanya kolom `fileName`, bukan berkas di disk). */
export async function renameMediaAction(
  id: string,
  fileName: string,
): Promise<MediaActionResult> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth;

  const clean = fileName.trim().slice(0, 255);
  if (!clean) return { ok: false, error: "Nama berkas wajib diisi." };

  let mediaId: bigint;
  try {
    mediaId = BigInt(id);
  } catch {
    return { ok: false, error: "ID media tidak valid." };
  }

  const media = await db.media.update({
    where: { id: mediaId },
    data: { fileName: clean },
  });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "media",
    entityId: media.id,
    meta: { fileName: media.fileName },
  });

  revalidatePath("/admin/media");
  return { ok: true };
}

/** Hapus media: hapus berkas di disk lalu baris database. */
export async function deleteMediaAction(
  id: string,
): Promise<MediaActionResult> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth;

  let mediaId: bigint;
  try {
    mediaId = BigInt(id);
  } catch {
    return { ok: false, error: "ID media tidak valid." };
  }

  const media = await db.media.findUnique({ where: { id: mediaId } });
  if (!media) return { ok: false, error: "Media tidak ditemukan." };

  // Hapus berkas fisik; abaikan bila sudah tidak ada.
  try {
    const abs = path.join(process.cwd(), media.path.replace(/^\//, ""));
    await unlink(abs);
  } catch {
    // diabaikan
  }

  await db.media.delete({ where: { id: mediaId } });
  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "media",
    entityId: mediaId,
    meta: { fileName: media.fileName },
  });

  revalidatePath("/admin/media");
  return { ok: true };
}