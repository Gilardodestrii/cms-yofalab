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

/** ISR 5 menit: blok Home dari `pages.HOME` + produk/artikel terbaru. Searchbar memakai SearchInput bersama. */
export const revalidate = 300;

/**
 * Ikon statistik Home, dicocokkan dari label entri (fallback urutan).
 * Sesuai mockup: gedung (established), kubus (products), dua orang (partners).
 * SVG inline; proyek ini tidak memakai pustaka ikon.
 */
const STAT_ICONS: { match: RegExp; icon: React.ReactNode }[] = [
  {
    // Gedung kantor — established.
    match: /establish|berdiri|tahun|since|sejak/i,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M9 21v-4h6v4" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
      </svg>
    ),
  },
  {
    // Kubus 3D — products.
    match: /product|produk/i,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    // Dua orang — partners.
    match: /partner|mitra|client|klien|customer/i,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

/** Ikon statistik berdasarkan label; fallback gedung bila tidak cocok. */
function statIcon(label: string, index: number): React.ReactNode {
  const found = STAT_ICONS.find((s) => s.match.test(label));
  if (found) return found.icon;
  return STAT_ICONS[index % STAT_ICONS.length].icon;
}

/**
 * Ikon bulat untuk daftar keunggulan. Dijajarkan berdasarkan urutan entri —
 * sesuai mockup: jempol (mutu), truk (dukungan), perisai (pelatihan).
 * SVG inline; proyek ini tidak memakai pustaka ikon.
 */
const ADVANTAGE_ICONS = [
  // Jempol ke atas — mutu produk.
  <svg key="thumb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>,
  // Truk pengiriman — dukungan menyeluruh.
  <svg key="truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>,
  // Perisai centang — pelatihan ahli.
  <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
];

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
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center rounded-md bg-surface p-6 shadow-card">
              <dd className="flex flex-col items-center">
                <span className="text-brand-600">{statIcon(s.label, i)}</span>
                <span className="mt-2 font-heading text-3xl font-bold text-ink-900">{s.value}</span>
              </dd>
              <dt className="mt-1 font-body text-sm text-brand-600">{s.label}</dt>
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
      <section className="container-site py-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <ul className="flex flex-col gap-6">
            {content.advantages.map((a, i) => (
              <li key={a.title} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-600 text-brand-600">
                  {ADVANTAGE_ICONS[i % ADVANTAGE_ICONS.length]}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-brand-600">{a.title}</h3>
                  <p className="mt-1 font-body text-sm text-ink-600">{a.body}</p>
                </div>
              </li>
            ))}
          </ul>
          {content.advantagesImagePath ? (
            <div className="overflow-hidden rounded-md bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.advantagesImagePath}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ) : null}
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
