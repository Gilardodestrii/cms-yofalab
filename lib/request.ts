import { createHash } from "node:crypto";

/**
 * Ambil alamat IP klien dari header proxy umum.
 * Di balik Nginx, header `x-forwarded-for` berisi daftar IP dipisah koma;
 * elemen pertama adalah klien asli.
 */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    null
  );
}

/**
 * Hash IP dengan SHA-256 sebelum disimpan.
 * Alasan privasi: `comments.ip_hash` dan `contact_messages.ip_hash` tidak boleh
 * menyimpan IP mentah. `salt` opsional dari AUTH_SECRET agar tidak dapat
 * dienumerasi dengan rainbow table IP publik.
 */
export function hashIp(ip: string | null, salt = ""): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
