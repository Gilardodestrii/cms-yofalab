"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { hasRole } from "@/lib/auth/roles";
import { parseImagePath } from "@/lib/image-path";
import {
  contactSettingSchema,
  footerSettingSchema,
  siteSettingSchema,
  uploadSettingSchema,
} from "@/lib/validators/settings";

export type SettingsActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Hanya SUPER_ADMIN yang boleh mengubah pengaturan situs. */
async function ensureSuperAdmin(): Promise<
  { ok: true; userId: bigint } | { ok: false; result: SettingsActionState }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, ["SUPER_ADMIN"])) {
    return { ok: false, result: { error: "Hanya Super Admin yang dapat mengubah pengaturan." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

async function upsertSetting(key: string, value: object): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** Revalidasi halaman publik yang menampilkan pengaturan. */
function revalidatePublic(): void {
  revalidatePath("/", "layout");
}

/** Simpan info kontak (`site_settings.contact`). */
export async function saveContactSettingAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return auth.result;

  const parsed = contactSettingSchema.safeParse({
    address: formData.get("address"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "address")] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  await upsertSetting("contact", parsed.data);
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "setting",
    meta: { key: "contact" },
  });
  revalidatePublic();
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Simpan footer + tautan sosial (`site_settings.footer`). */
export async function saveFooterSettingAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return auth.result;

  const parsed = footerSettingSchema.safeParse({
    copyright: formData.get("copyright"),
    description: formData.get("description"),
    facebook: formData.get("facebook"),
    instagram: formData.get("instagram"),
    linkedin: formData.get("linkedin"),
    youtube: formData.get("youtube"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "copyright")] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  await upsertSetting("footer", parsed.data);
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "setting",
    meta: { key: "footer" },
  });
  revalidatePublic();
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Simpan identitas + SEO default (`site_settings.site`). */
export async function saveSiteSettingAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return auth.result;

  const parsed = siteSettingSchema.safeParse({
    name: formData.get("name"),
    logoPath: parseImagePath(formData.get("logoImage")),
    logoWhitePath: parseImagePath(formData.get("logoWhiteImage")),
    tagline: formData.get("tagline"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    notifyEmail: formData.get("notifyEmail"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "name")] ??= issue.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors };
  }

  await upsertSetting("site", parsed.data);
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "setting",
    meta: { key: "site" },
  });
  revalidatePublic();
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Simpan batas ukuran unggahan (`site_settings.upload`). */
export async function saveUploadSettingAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await ensureSuperAdmin();
  if (!auth.ok) return auth.result;

  const parsed = uploadSettingSchema.safeParse({ maxUploadMb: formData.get("maxUploadMb") });
  if (!parsed.success) {
    return {
      error: "Periksa kembali isian formulir.",
      fieldErrors: { maxUploadMb: "Ukuran harus 1–50 MB." },
    };
  }

  await upsertSetting("upload", parsed.data);
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "setting",
    meta: { key: "upload" },
  });
  revalidatePath("/admin/settings");
  return { ok: true };
}
