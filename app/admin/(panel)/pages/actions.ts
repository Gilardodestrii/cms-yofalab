"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth/guards";
import { CONTENT_ROLES, hasRole } from "@/lib/auth/roles";
import { aboutPageSchema, homePageSchema } from "@/lib/validators/pages";
import type { Prisma } from "@prisma/client";

export type PageActionState = {
  ok?: boolean;
  error?: string;
};

async function ensureContentUser(): Promise<
  { ok: true; userId: bigint } | { ok: false; result: PageActionState }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { error: "Tidak terautentikasi." } };
  if (!hasRole(user.role, CONTENT_ROLES)) {
    return { ok: false, result: { error: "Anda tidak berhak mengubah halaman." } };
  }
  return { ok: true, userId: BigInt(user.id) };
}

async function upsertPage(key: "HOME" | "ABOUT", content: Prisma.InputJsonValue, userId: bigint) {
  await db.page.upsert({
    where: { key },
    update: { content, updatedBy: userId },
    create: { key, content, updatedBy: userId },
  });
}

/** Baris dari textarea multi-baris (abaikan baris kosong). */
function lines(value: FormDataEntryValue | null, max = 20): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Baris "judul|isi" untuk keunggulan Home. */
function parseAdvantages(value: FormDataEntryValue | null) {
  return lines(value, 6).map((line) => {
    const [title = "", ...rest] = line.split("|");
    return { title: title.trim(), body: rest.join("|").trim() };
  });
}

/** Slide hero dari hidden input JSON (dikirim komponen MediaPicker). */
function parseSlides(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const raw = JSON.parse(value) as { path?: string; altText?: string | null; fileName?: string }[];
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((s) => typeof s?.path === "string" && s.path.startsWith("/uploads/"))
      .slice(0, 8)
      .map((s) => ({
        title: "",
        subtitle: "",
        imagePath: s.path as string,
        linkLabel: "",
        linkHref: "",
      }));
  } catch {
    return [];
  }
}

/** Simpan blok Home (`pages.HOME`). */
export async function saveHomePageAction(
  _prev: PageActionState,
  formData: FormData,
): Promise<PageActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  const parsed = homePageSchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    slides: parseSlides(formData.get("slides")),
    stats: lines(formData.get("stats"), 6).map((line) => {
      const [value = "", ...rest] = line.split("|");
      return { value: value.trim(), label: rest.join("|").trim() };
    }),
    getToKnowTitle: formData.get("getToKnowTitle"),
    getToKnowBody: formData.get("getToKnowBody"),
    advantages: parseAdvantages(formData.get("advantages")),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir." };
  }

  await upsertPage("HOME", parsed.data as unknown as Prisma.InputJsonValue, auth.userId);
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "page",
    meta: { key: "HOME" },
  });

  revalidatePath("/");
  revalidatePath("/admin/pages");
  return { ok: true };
}

/** Simpan About Us (`pages.ABOUT`). */
export async function saveAboutPageAction(
  _prev: PageActionState,
  formData: FormData,
): Promise<PageActionState> {
  const auth = await ensureContentUser();
  if (!auth.ok) return auth.result;

  const parsed = aboutPageSchema.safeParse({
    profile: formData.get("profile"),
    vision: formData.get("vision"),
    mission: lines(formData.get("mission"), 20),
    rnd: formData.get("rnd"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian formulir." };
  }

  await upsertPage("ABOUT", parsed.data as unknown as Prisma.InputJsonValue, auth.userId);
  await recordActivity({
    userId: auth.userId,
    action: "update",
    entity: "page",
    meta: { key: "ABOUT" },
  });

  revalidatePath("/about");
  revalidatePath("/admin/pages");
  return { ok: true };
}
