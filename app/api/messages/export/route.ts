import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/guards";
import { ADMIN_BASE_ROLES, hasRole } from "@/lib/auth/roles";
import type { Prisma } from "@prisma/client";

/** Bungkus nilai CSV: kutip ganda + escape kutip di dalamnya. */
function csvCell(value: string): string {
  const clean = value.replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${clean}"`;
}

const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  READ: "Dibaca",
  FOLLOWED_UP: "Ditindaklanjuti",
};

/**
 * GET /api/messages/export — ekspor pesan kontak ke CSV.
 * Menghormati filter `status` dan `q` yang aktif di halaman daftar.
 * UTF-8 BOM ditambahkan agar Excel membaca aksen dengan benar.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasRole(user.role, ADMIN_BASE_ROLES)) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusRaw = searchParams.get("status") ?? "";
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);

  const where: Prisma.ContactMessageWhereInput = {};
  if (["NEW", "READ", "FOLLOWED_UP"].includes(statusRaw)) {
    where.status = statusRaw as "NEW" | "READ" | "FOLLOWED_UP";
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { subject: { contains: q } },
      { message: { contains: q } },
    ];
  }

  const items = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      status: true,
      internalNote: true,
      createdAt: true,
    },
  });

  const header = ["ID", "Tanggal", "Nama", "Email", "Subjek", "Pesan", "Status", "Catatan Internal"];
  const rows = items.map((m) =>
    [
      m.id.toString(),
      new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(m.createdAt),
      m.name,
      m.email,
      m.subject ?? "",
      m.message,
      STATUS_LABEL[m.status] ?? m.status,
      m.internalNote ?? "",
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = `\uFEFF${header.map(csvCell).join(",")}\n${rows.join("\n")}`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pesan-kontak-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
