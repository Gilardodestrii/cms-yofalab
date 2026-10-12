import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendContactNotification } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp, isSameOrigin } from "@/lib/request";
import { contactSchema } from "@/lib/validators/public";

/**
 * POST /api/contact — terima pesan kontak publik.
 * Honeypot: `company` terisi → balas sukses palsu tanpa menyimpan.
 * Rate limit: 5/jam per IP.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Permintaan lintas situs ditolak." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "company") continue;
      const key = String(issue.path[0] ?? "message");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json({ error: "Periksa kembali isian formulir.", fieldErrors }, { status: 422 });
  }
  const data = parsed.data;

  // Honeypot: pura-pura sukses agar bot tidak belajar.
  if (data.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request.headers);
  const limit = checkRateLimit({ key: `contact:${ip ?? "unknown"}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak pesan. Coba lagi nanti." },
      { status: 429 },
    );
  }

  // Simpan mentah; render publik tidak ada (hanya admin), jadi tanpa sanitasi HTML.
  const saved = await db.contactMessage.create({
    data: {
      name: data.name.trim().slice(0, 120),
      email: data.email.trim().toLowerCase().slice(0, 190),
      subject: data.subject.trim().slice(0, 200) || null,
      message: data.message.trim().slice(0, 10_000),
      ipHash: hashIp(ip, env.AUTH_SECRET),
    },
  });

  const mail = await sendContactNotification({
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    id: saved.id.toString(),
  });
  // ponytail: tanpa antrean email; kegagalan hanya dicatat, pesan tetap tersimpan.

  return NextResponse.json({ ok: true, mailSent: mail.ok });
}

/** Bentuk body yang ditolak Zod — dipakai untuk pesan error. */
export type ContactError = z.ZodError;
