import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request";
import { sanitizeHtml } from "@/lib/sanitize";
import { commentSchema } from "@/lib/validators/public";

/** Batas URL pada website komentator agar tidak jadi spam tautan. */
function normalizeWebsite(raw: string): string | null {
  const clean = raw.trim().slice(0, 255);
  if (!clean) return null;
  if (!/^(https?:\/\/)/i.test(clean)) return `https://${clean}`;
  return clean;
}

/**
 * POST /api/comments — terima komentar publik (status PENDING, perlu moderasi).
 * Honeypot: `website2` terisi → balas sukses palsu tanpa menyimpan.
 * Rate limit: 5/jam per IP.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "body");
      if (key === "website2") continue;
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json({ error: "Periksa kembali isian formulir.", fieldErrors }, { status: 422 });
  }
  const data = parsed.data;

  // Honeypot: pura-pura sukses agar bot tidak belajar.
  if (data.website2.trim()) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({ key: `comment:${ip ?? "unknown"}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak komentar. Coba lagi nanti." },
      { status: 429 },
    );
  }

  let postId: bigint;
  try {
    postId = BigInt(data.postId);
  } catch {
    return NextResponse.json({ error: "Artikel tidak valid." }, { status: 422 });
  }

  const post = await db.post.findFirst({
    where: { id: postId, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { slug: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  await db.comment.create({
    data: {
      postId,
      name: data.name.trim().slice(0, 120),
      email: data.email.trim().toLowerCase().slice(0, 190),
      website: normalizeWebsite(data.website),
      // Sanitasi: komentar dirender sebagai HTML aman di halaman publik.
      body: sanitizeHtml(data.body.trim().slice(0, 5000)),
      status: "PENDING",
      ipHash: hashIp(ip, env.AUTH_SECRET),
    },
  });

  revalidatePath(`/blog/${post.slug}`);

  return NextResponse.json({ ok: true });
}
