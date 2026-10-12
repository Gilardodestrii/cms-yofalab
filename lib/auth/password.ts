import bcrypt from "bcryptjs";

/**
 * Utilitas hash kata sandi memakai bcrypt.
 * Cost 10: cukup kuat untuk perangkat server biasa dan tetap cepat (~50-100 ms).
 */
const BCRYPT_ROUNDS = 10;

/** Hasilkan hash aman dari kata sandi mentah. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Bandingkan kata sandi mentah dengan hash tersimpan.
 * Selalu mengembalikan boolean; tidak melempar meski hash rusak.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
