"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { hasRole } from "@/lib/auth/roles";
import { userSchema } from "@/lib/validators/auth";

export type UserActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Hanya SUPER_ADMIN yang boleh mengelola pengguna. */
async function ensureSuperAdmin(): Promise<
  { ok: true; userId: bigint } | { ok: false; result: UserActionState }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, ["SUPER_ADMIN"])) {
    return { ok: false, result: { error: "Hanya Super Admin yang dapat mengelola pengguna." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

function fieldErrorsOf(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    fieldErrors[String(issue.path[0] ?? "name")] ??= issue.message;
  }
  return fieldErrors;
}

/** Buat akun admin baru. */
export async function createUserAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return auth.result;

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const data = parsed.data;
  if (!data.password) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { password: "Kata sandi wajib diisi." } };
  }

  const exists = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (exists) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { email: "Email sudah dipakai." } };
  }

  const created = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      role: data.role,
      isActive: data.isActive,
    },
  });

  await recordActivity({
    userId: auth.userId,
    action: "create",
    entity: "user",
    entityId: created.id,
    meta: { email: created.email, role: created.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

/** Ubah akun admin (kata sandi hanya diganti bila diisi). */
export async function updateUserAction(
  id: string,
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return auth.result;

  let userId: bigint;
  try {
    userId = BigInt(id);
  } catch {
    return { error: "ID pengguna tidak valid." };
  }

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) return { error: "Pengguna tidak ditemukan." };

  const clash = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (clash && clash.id !== userId) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: { email: "Email sudah dipakai." } };
  }

  // Cegah Super Admin terakhir menurunkan peran/menonaktifkan dirinya sendiri.
  if (existing.role === "SUPER_ADMIN" && (data.role !== "SUPER_ADMIN" || !data.isActive)) {
    const activeSupers = await db.user.count({
      where: { role: "SUPER_ADMIN", isActive: true, id: { not: userId } },
    });
    if (activeSupers === 0) {
      return { error: "Tidak boleh menghapus peran Super Admin aktif terakhir." };
    }
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });

  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "user",
    entityId: userId,
    meta: { email: data.email, role: data.role, passwordReset: Boolean(data.password) },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

/** Hapus akun admin (tidak boleh menghapus diri sendiri / Super Admin terakhir). */
export async function deleteUserAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return { ok: false, error: auth.result.error ?? "Tidak berhak." };

  let userId: bigint;
  try {
    userId = BigInt(id);
  } catch {
    return { ok: false, error: "ID pengguna tidak valid." };
  }
  if (userId === auth.userId) return { ok: false, error: "Tidak dapat menghapus akun sendiri." };

  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) return { ok: false, error: "Pengguna tidak ditemukan." };

  if (existing.role === "SUPER_ADMIN") {
    const others = await db.user.count({
      where: { role: "SUPER_ADMIN", isActive: true, id: { not: userId } },
    });
    if (others === 0) return { ok: false, error: "Tidak dapat menghapus Super Admin aktif terakhir." };
  }

  // Artikel terkait pengguna ini bersifat wajib (FK authorId) → tolak bila ada.
  const postCount = await db.post.count({ where: { authorId: userId } });
  if (postCount > 0) {
    return { ok: false, error: `Pengguna punya ${postCount} artikel. Nonaktifkan saja, atau pindahkan artikelnya dulu.` };
  }

  await db.user.delete({ where: { id: userId } });
  await recordActivity({
    userId: auth.userId,
    action: "delete",
    entity: "user",
    entityId: userId,
    meta: { email: existing.email },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}
