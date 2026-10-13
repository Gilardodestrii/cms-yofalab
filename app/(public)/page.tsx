import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button";
import { CategoryLabel } from "@/components/ui/category-label";
import { SearchInput } from "@/components/ui/search-input";
import { getHomePageContent } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Home",
  description:
    "YOFALAB Indonesia - penyedia alat kesehatan dan reagen laboratorium terpercaya sejak 2015.",
  alternates: { canonical: "/" },
};

/** ISR 5 menit: blok Home dari `pages.HOME` + produk/artikel terbaru. */
export const revalidate = 300;

/**
 * Home publik: hero + slide, statistik, Get to Know, keunggulan (dari
 * `pages.HOME`), carousel kategori produk, pencarian blog, 3 blog terbaru.
 */
export default async function HomePage() {
  let categories: {
    name: string;
    slug: string;
    imageMedia: { path: string; fileName: string; altText: string | null } | null;
    _count: { products: number };
  }[] = [];
  let productCount = 0;
  let latestPosts: {
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    cover: { path: string; fileName: string; altText: string | null } | null;
  }[] = [];
  const content = await getHomePageContent();
  try {
    [categories, productCount, latestPosts] = await Promise.all([
      db.productCategory.findMany({
        orderBy: { sortOrder: "asc" },
        take: 12,
        select: {
          name: true,
          slug: true,
          imageMedia: { select: { path: true, fileName: true, altText: true } },
          _count: { select: { products: true } },
        },
      }),
      db.product.count({ where: { status: "PUBLISHED" } }),
      db.post.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: 3,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          cover: { select: { path: true, fileName: true, altText: true } },
        },
      }),
    ]);
  } catch {
    // Database belum siap (mis. saat build): tampilkan kerangka tanpa data.
  }

  // Statistik: nilai "Products" dihitung otomatis dari jumlah produk terbit.
  const stats = content.stats.map((s) =>
    s.label.toLowerCase() === "products" ? { ...s, value: `${productCount}+` } : s,
  );

  const slides = content.slides.filter((s) => s.imagePath);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-50">
        <div className="container-site py-16 md:py-24">
          <CategoryLabel>YOFALAB Indonesia</CategoryLabel>
          <h1 className="mt-2 max-w-reading text-4xl font-bold md:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mt-4 max-w-reading font-body text-base text-ink-600">
            {content.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/contact" variant="hero">
              Contact Us
            </ButtonLink>
            <ButtonLink href="/product" variant="outline">
              Lihat Produk
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Slide hero tambahan (dikelola dari /admin/pages) */}
      {slides.length > 0 && (
        <section className="container-site py-8">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((s, i) => (
              <li key={`${s.imagePath}-${i}`} className="overflow-hidden rounded-md bg-surface shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.imagePath}
                  alt={s.title || `Slide ${i + 1}`}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
                {(s.title || s.subtitle) && (
                  <div className="p-4">
                    {s.title && <p className="font-heading text-sm font-semibold text-ink-900">{s.title}</p>}
                    {s.subtitle && <p className="mt-1 font-body text-xs text-ink-600">{s.subtitle}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Statistik */}
      <section className="container-site py-10">
        <dl className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="panel-card p-6">
              <dt className="order-2 mt-1 font-body text-sm text-ink-600">{s.label}</dt>
              <dd className="font-heading text-3xl font-bold text-brand-600">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Get to Know */}
      <section className="container-site py-10">
        <div
          className={
            content.getToKnowImagePath
              ? "grid items-center gap-8 md:grid-cols-2"
              : undefined
          }
        >
          {content.getToKnowImagePath ? (
            <div className="overflow-hidden rounded-md bg-surface-muted shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.getToKnowImagePath}
                alt={content.getToKnowTitle}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ) : null}
          <div>
            <CategoryLabel>Get to Know YOFALAB</CategoryLabel>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-ink-900 md:text-3xl">
              {content.getToKnowTitle}
            </h2>
            <p className="mt-4 max-w-reading whitespace-pre-line font-body text-base text-ink-600">
              {content.getToKnowBody}{" "}
              <Link href="/about" className="font-semibold text-brand-600 hover:text-brand-600">
                Pelajari lebih lanjut →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="bg-brand-50">
        <div className="container-site grid gap-6 py-12 sm:grid-cols-3">
          {content.advantages.map((a) => (
            <article key={a.title} className="rounded-md bg-surface p-6 shadow-card">
              <h3 className="font-heading text-lg font-semibold text-ink-900">{a.title}</h3>
              <p className="mt-2 font-body text-sm text-ink-600">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Carousel kategori produk */}
      <section className="container-site py-12">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl font-semibold text-ink-900">
            Product Category
          </h2>
          <Link href="/product" className="font-body text-sm font-semibold text-brand-600 hover:text-brand-600">
            Lihat semua →
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="mt-4 font-body text-base text-ink-400">Kategori produk segera hadir.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/product?kategori=${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-md bg-surface shadow-card hover:shadow-card-hover"
                >
                  <span className="flex aspect-[4/3] items-center justify-center bg-surface-muted">
                    {c.imageMedia?.path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageMedia.path} alt={c.imageMedia.altText ?? c.imageMedia.fileName} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden="true" className="font-heading text-4xl text-ink-400">◈</span>
                    )}
                  </span>
                  <span className="p-3 text-center font-heading text-sm font-semibold text-ink-900 group-hover:text-brand-600">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pencarian blog + 3 terbaru */}
      <section className="bg-brand-50">
        <div className="container-site py-12">
          <h2 className="text-center font-heading text-2xl font-semibold text-ink-900">
            Blog Terbaru
          </h2>
          <div className="mt-4 flex justify-center">
            <SearchInput placeholder="Cari artikel…" name="q" basePath="/blog" />
          </div>
          {latestPosts.length === 0 ? (
            <p className="mt-6 text-center font-body text-base text-ink-400">
              Artikel segera hadir. Lihat <Link href="/blog" className="font-semibold text-brand-600">semua artikel →</Link>
            </p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-3">
              {latestPosts.map((p) => (
                <li key={p.slug} className="flex flex-col overflow-hidden rounded-md bg-surface shadow-card">
                  <Link href={`/blog/${p.slug}`} className="flex aspect-[16/9] items-center justify-center bg-surface-muted" aria-label={`Baca ${p.title}`}>
                    {p.cover?.path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover.path} alt={p.cover.altText ?? p.cover.fileName} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden="true" className="font-heading text-4xl text-ink-400">✎</span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-heading text-base font-semibold text-ink-900">
                      <Link href={`/blog/${p.slug}`} className="hover:text-brand-600">{p.title}</Link>
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-2 font-body text-sm text-ink-600">{p.excerpt}</p>
                    )}
                    <Link href={`/blog/${p.slug}`} className="mt-3 font-body text-sm font-semibold text-brand-600 hover:text-brand-600">
                      Read more
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
