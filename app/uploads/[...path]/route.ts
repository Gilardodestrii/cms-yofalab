import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

/** Peta tipe MIME berdasarkan ekstensi berkas yang disajikan. */
const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/**
 * GET /uploads/[...path] — menyajikan berkas dari folder unggahan.
 *
 * Berkas unggahan ditulis ke `UPLOAD_DIR` (di luar `public/`) saat runtime,
 * sehingga tidak otomatis tersaji oleh Next. Handler ini menghadirkan skema
 * URL publik `/uploads/...` yang dipakai `media.path`.
 *
 * Keamanan: hanya nama berkas di dalam `UPLOAD_DIR` yang dilayani; `..` dan
 * path absolut ditolak untuk mencegah path traversal.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  const uploadRoot = path.join(process.cwd(), env.UPLOAD_DIR);
  const requested = path.join(uploadRoot, ...segments);
  const normalized = path.normalize(requested);

  // Cegah path traversal: hasil normalisasi harus berada di dalam uploadRoot.
  if (!normalized.startsWith(uploadRoot + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(normalized).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(normalized);
    if (!info.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }
    const data = await readFile(normalized);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}