import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Aksi yang dicatat (selaras kolom `activity_logs.action` VARCHAR(40)). */
export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "upload";

export type RecordActivityInput = {
  userId?: bigint | null;
  action: ActivityAction;
  /** Nama entitas, mis. "product", "post", "user", "media". */
  entity: string;
  entityId?: bigint | null;
  /** Metadata tambahan (disimpan sebagai JSON). */
  meta?: Prisma.InputJsonValue;
  /**
   * Alamat IP klien. Disimpan apa adanya di kolom `ip` VARCHAR(45)
   * (sesuai `docs/schema.sql`); dipangkas ke 45 karakter agar aman.
   */
  ip?: string | null;
};

/**
 * Catat satu aktivitas admin ke `activity_logs`.
 * Sengaja tidak melempar error: kegagalan logging tidak boleh menggagalkan
 * aksi utama pengguna (log cukup ditulis ke console).
 */
export async function recordActivity(input: RecordActivityInput): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        meta: input.meta,
        ip: input.ip ? input.ip.slice(0, 45) : null,
      },
    });
  } catch (error) {
    console.error("[activity] gagal mencatat aktivitas:", error);
  }
}
