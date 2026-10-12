"use server";

import { signOut } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/guards";
import { recordActivity } from "@/lib/activity";

/**
 * Keluar dari sesi admin. Mencatat aktivitas logout lalu mengarahkan ke
 * halaman login.
 */
export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await recordActivity({
      userId: BigInt(user.id),
      action: "logout",
      entity: "user",
      entityId: BigInt(user.id),
    });
  }
  await signOut({ redirectTo: "/admin/login" });
}