import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import { env } from "@/lib/env";

/** Tipe MIME yang diizinkan untuk unggahan media. */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
] as const;

export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

/** Ekstensi aman per tipe MIME (mencegah ekstensi berbahaya seperti .exe). */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

export const MAX_UPLOAD_BYTES = env.MAX_UPLOAD_BYTES;

export function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export type StoredFile = {
  fileName: string;
  /** Path publik relatif, mis. `/uploads/2026/01/xxx.png`. */
  path: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

export type UploadResult =
  { ok: true; file: StoredFile } | { ok: false; error: string };

/** Nama berkas dasar yang aman (tanpa path, hanya alfanumerik dan dash). */
function sanitizeBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const safe = base
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return safe || "file";
}

/** Ambil dimensi gambar dari buffer; mengembalikan null bila bukan gambar. */
function getImageDimensions(
  buffer: Buffer,
  mime: string,
): { width: number | null; height: number | null } {
  if (mime === "application/pdf" || mime === "image/svg+xml") {
    return { width: null, height: null };
  }
  try {
    const dim = imageSize(buffer);
    return { width: dim.width ?? null, height: dim.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

/**
 * Validasi dan simpan satu berkas unggahan ke folder `uploads/`.
 *
 * Validasi dilakukan di server (bukan hanya `accept` di input):
 * - Tipe MIME harus di whitelist (menolak `.exe` dan sejenisnya).
 * - Ukuran tidak melebihi `MAX_UPLOAD_BYTES`.
 * Nama berkas dibuat acak untuk mencegah tabrakan dan path traversal.
 */
export async function saveUpload(file: File): Promise<UploadResult> {
  if (!isAllowedMime(file.type)) {
    return {
      ok: false,
      error:
        "Tipe berkas tidak diizinkan. Gunakan JPG, PNG, WEBP, GIF, SVG, atau PDF.",
    };
  }
  if (file.size <= 0) {
    return { ok: false, error: "Berkas kosong." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(1);
    return { ok: false, error: `Ukuran berkas melebihi batas ${mb} MB.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Sub-folder per bulan agar folder tidak terlalu besar.
  const now = new Date();
  const relDir = path
    .join(
      env.UPLOAD_DIR,
      `${now.getFullYear()}`,
      `${String(now.getMonth() + 1).padStart(2, "0")}`,
    )
    .replace(/\\/g, "/");

  const ext = EXTENSION_BY_MIME[file.type] ?? "";
  const base = sanitizeBaseName(file.name);
  const unique = randomUUID().slice(0, 8);
  const fileName = `${base}-${unique}${ext}`;

  const absDir = path.resolve(process.cwd(), relDir);

  // Pertahanan berlapis: pastikan folder tujuan tetap di dalam root proyek.
  // `env.UPLOAD_DIR` sudah divalidasi, tetapi cek ini menutup jalur penulisan
  // berkas di luar proyek (mis. `/etc/...`) bila suatu saat validasi env
  // dilonggarkan atau nilai datang dari sumber lain.
  const projectRoot = process.cwd();
  if (absDir !== projectRoot && !absDir.startsWith(projectRoot + path.sep)) {
    return {
      ok: false,
      error: "Folder unggahan tidak valid.",
    };
  }

  await mkdir(absDir, { recursive: true });
  await writeFile(path.join(absDir, fileName), buffer);

  const { width, height } = getImageDimensions(buffer, file.type);

  return {
    ok: true,
    file: {
      fileName,
      path: `/${relDir}/${fileName}`,
      mimeType: file.type,
      size: file.size,
      width,
      height,
    },
  };
}

/** Hash isi berkas (dipakai bila kelak perlu deteksi duplikat). */
export function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}
