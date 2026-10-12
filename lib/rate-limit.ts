/**
 * Rate limiter in-memory sederhana dengan jendela geser berbasis waktu.
 *
 * Catatan: penyimpanan berada di memori proses, jadi cocok untuk satu instance
 * (deployment PM2 mode fork / Docker tunggal). Bila kelak berjalan multi-instance,
 * ganti implementasi ini dengan Redis tanpa mengubah API.
 */

type Bucket = {
  /** Timestamp (ms) setiap percobaan yang masih dalam jendela. */
  hits: number[];
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Kunci unik, mis. `login:<hash-ip>`. */
  key: string;
  /** Jumlah maksimum percobaan dalam jendela. */
  limit: number;
  /** Panjang jendela dalam milidetik. */
  windowMs: number;
};

export type RateLimitResult = {
  /** true bila permintaan diizinkan. */
  allowed: boolean;
  /** Sisa percobaan yang tersedia. */
  remaining: number;
  /** Waktu (ms) sampai percobaan berikutnya diizinkan bila diblokir. */
  retryAfterMs: number;
};

/**
 * Periksa dan catat satu percobaan untuk `key`.
 * Bila sudah mencapai batas, percobaan tidak dicatat dan `allowed` = false.
 */
export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };

  // Buang percobaan yang sudah keluar dari jendela.
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, windowMs - (now - oldest)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.hits.length),
    retryAfterMs: 0,
  };
}

/** Hapus catatan percobaan untuk `key` (mis. setelah login sukses). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Pembersih berkala agar Map tidak tumbuh tanpa batas pada proses yang lama
 * hidup. Dipanggil malas saat modul dimuat; interval `unref` agar tidak menahan
 * proses tetap berjalan.
 */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    v.hits = v.hits.filter((t) => now - t < CLEANUP_INTERVAL_MS);
    if (v.hits.length === 0) buckets.delete(k);
  }
}, CLEANUP_INTERVAL_MS);
if (typeof cleanup.unref === "function") cleanup.unref();
