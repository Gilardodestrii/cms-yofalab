import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Breadcrumb } from "@/components/admin/breadcrumb";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/** Format tanggal ringkas berbahasa Indonesia. */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Dashboard admin: kartu jumlah (produk, artikel, pesan baru, komentar
 * menunggu), 5 pesan terbaru, dan pintasan tambah konten.
 */
export default async function AdminDashboardPage() {
  const [
    productCount,
    postCount,
    newMessageCount,
    pendingCommentCount,
    latestMessages,
  ] = await Promise.all([
    db.product.count(),
    db.post.count(),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.comment.count({ where: { status: "PENDING" } }),
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const cards = [
    {
      label: "Produk",
      value: productCount,
      href: "/admin/products",
      icon: "▣",
    },
    { label: "Artikel", value: postCount, href: "/admin/posts", icon: "✎" },
    {
      label: "Pesan Baru",
      value: newMessageCount,
      href: "/admin/messages",
      icon: "✉",
    },
    {
      label: "Komentar Menunggu",
      value: pendingCommentCount,
      href: "/admin/comments",
      icon: "❝",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb items={[{ label: "Dashboard" }]} />
        <div className="flex gap-3">
          {/* Memakai token admin (h-9), bukan `ButtonLink` publik: token publik
              memadukan `btn-primary` (h-10) dengan `btn-outline` (h-12) sehingga
              kedua tombol ini tampil beda tinggi. Token admin seragam 36 px dan
              sama dengan tombol aksi di halaman admin lain. */}
          <Link href="/admin/products/new" className="btn-admin">
            Tambah Produk
          </Link>
          <Link href="/admin/posts/new" className="btn-admin-secondary">
            Tulis Artikel
          </Link>
        </div>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="panel-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ink-600">
                {card.label}
              </span>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-50 text-brand-600"
              >
                {card.icon}
              </span>
            </div>
            <p className="mt-2 font-heading text-[28px] font-semibold leading-none text-ink-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Pesan terbaru */}
      <section className="panel-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-heading text-base font-semibold text-ink-900">
            Pesan Terbaru
          </h2>
          <Link
            href="/admin/messages"
            className="font-body text-sm font-semibold text-brand-600"
          >
            Lihat semua
          </Link>
        </div>
        {latestMessages.length === 0 ? (
          <p className="p-8 text-center font-body text-sm text-ink-400">
            Belum ada pesan masuk.
          </p>
        ) : (
          <ul>
            {latestMessages.map((msg) => (
              <li
                key={msg.id.toString()}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-semibold text-ink-900">
                    {msg.subject || "(Tanpa subjek)"}
                  </p>
                  <p className="truncate font-body text-xs text-ink-400">
                    {msg.name} · {msg.email}
                  </p>
                </div>
                <span className="font-body text-xs text-ink-400">
                  {formatDate(msg.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
