import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { PostCard } from "@/components/ui/post-card";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artikel dan informasi seputar alat kesehatan, reagen laboratorium, serta kesehatan dari YOFALAB Indonesia.",
  alternates: { canonical: "/blog" },
};

/** ISR 5 menit: daftar artikel menyusul artikel baru terjadwal. */
export const revalidate = 300;

const PER_PAGE = 9;

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Daftar artikel publik: filter kategori, pencarian, paginasi. */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const categorySlug = typeof params.kategori === "string" ? params.kategori : "";
  const pageRaw = Number.parseInt(typeof params.page === "string" ? params.page : "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const categories = await db.postCategory
    .findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } })
    .catch(() => []);
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  // Hanya artikel terbit dan sudah lewat jadwalnya (penjadwalan dihormati).
  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };
  if (activeCategory) where.categoryId = activeCategory.id;
  if (q) where.title = { contains: q };

  let items: {
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    category: { name: string } | null;
    cover: { path: string; fileName: string; altText: string | null } | null;
  }[] = [];
  let total = 0;
  try {
    [items, total] = await Promise.all([
      db.post.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          category: { select: { name: true } },
          cover: { select: { path: true, fileName: true, altText: true } },
        },
      }),
      db.post.count({ where }),
    ]);
  } catch {
    // Database belum siap (mis. saat build): tampilkan daftar kosong.
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const query: Record<string, string> = {};
  if (q) query.q = q;
  if (categorySlug) query.kategori = categorySlug;

  return (
    <div>
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">Blog</h1>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori">
          <Link
            href="/blog"
            aria-current={!activeCategory ? "page" : undefined}
            className={!activeCategory
              ? "rounded-full bg-brand-600 px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-white"
              : "rounded-full border border-line bg-surface px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-ink-600 hover:border-brand-600 hover:text-brand-600"}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog?kategori=${c.slug}`}
              aria-current={activeCategory?.id === c.id ? "page" : undefined}
              className={activeCategory?.id === c.id
                ? "rounded-full bg-brand-600 px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-white"
                : "rounded-full border border-line bg-surface px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-ink-600 hover:border-brand-600 hover:text-brand-600"}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <SearchInput placeholder="Cari artikel…" />
        </div>

        {items.length === 0 ? (
          <p className="py-16 text-center font-body text-base text-ink-400">
            Belum ada artikel{activeCategory ? ` di kategori ${activeCategory.name}` : ""}{q ? ` untuk “${q}”` : ""}.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PostCard
                key={p.slug}
                slug={p.slug}
                title={p.title}
                excerpt={p.excerpt}
                categoryName={p.category?.name}
                dateLabel={formatDate(p.publishedAt)}
                imagePath={p.cover?.path}
                imageAlt={p.cover?.altText ?? p.cover?.fileName}
              />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pagination page={page} totalPages={totalPages} basePath="/blog" query={query} />
        </div>
      </section>
    </div>
  );
}
