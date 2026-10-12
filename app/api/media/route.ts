import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/guards";
import { parsePagination } from "@/lib/pagination";

/**
 * GET /api/media — daftar media untuk media picker (JSON, dengan pencarian
 * dan paginasi). Hanya pengguna admin yang login.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const { skip, take, search } = parsePagination(searchParams, {
    defaultSort: "createdAt",
    allowedSort: ["createdAt", "fileName"],
  });

  const where = search
    ? { fileName: { contains: search } }
    : undefined;

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        path: true,
        fileName: true,
        altText: true,
        mimeType: true,
      },
    }),
    db.media.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((m) => ({ ...m, id: m.id.toString() })),
    total,
  });
}