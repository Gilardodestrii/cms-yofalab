import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { ProductCard } from "@/components/ui/product-card";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import type { Prisma } from "@prisma/client";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Product",
  description:
    "Katalog produk alat kesehatan YOFALAB Indonesia: Blood Grouping Reagent, Vacuum Blood Collection, dan Hemoglobin Meter.",
  alternates: { canonical: "/product" },
};

/** ISR 5 menit: katalog ikut berubah tanpa rebuild penuh. */
export const revalidate = 300;

const PER_PAGE = 12;

/** Katalog produk publik: grid 4-3-2-1, filter kategori, pencarian, paginasi. */
export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const categorySlug = typeof params.kategori === "string" ? params.kategori : "";
  const pageRaw = Number.parseInt(typeof params.page === "string" ? params.page : "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const categories = await db.productCategory
    .findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    })
    .catch(() => []);
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };
  if (activeCategory) where.categoryId = activeCategory.id;
  if (q) where.name = { contains: q };

  let items: {
    name: string;
    slug: string;
    category: { name: string };
    images: { media: { path: string; fileName: string; altText: string | null } }[];
  }[] = [];
  let total = 0;
  try {
    [items, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          name: true,
          slug: true,
          category: { select: { name: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { media: { select: { path: true, fileName: true, altText: true } } },
          },
        },
      }),
      db.product.count({ where }),
    ]);
  } catch {
    // Database belum siap: tampilkan grid kosong.
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const query: Record<string, string> = {};
  if (q) query.q = q;
  if (categorySlug) query.kategori = categorySlug;

  return (
    <div>
      {/* Banner */}
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {t("product", "title", locale)}
          </h1>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb
              items={[
                { label: t("common", "home", locale), href: "/" },
                { label: t("product", "breadcrumb", locale) },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        {/* Filter kategori */}
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori">
          <Link
            href="/product"
            aria-current={!activeCategory ? "page" : undefined}
            className={!activeCategory
              ? "rounded-full bg-brand-600 px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-white"
              : "rounded-full border border-line bg-surface px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-ink-600 hover:border-brand-600 hover:text-brand-600"}
          >
            {t("product", "allCategory", locale)}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/product?kategori=${c.slug}`}
              aria-current={activeCategory?.id === c.id ? "page" : undefined}
              className={activeCategory?.id === c.id
                ? "rounded-full bg-brand-600 px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-white"
                : "rounded-full border border-line bg-surface px-4 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-ink-600 hover:border-brand-600 hover:text-brand-600"}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Pencarian */}
        <div className="mt-6 flex justify-center">
          <SearchInput placeholder={t("product", "searchPlaceholder", locale)} />
        </div>

        {/* Grid 4-3-2-1 */}
        {items.length === 0 ? (
          <p className="py-16 text-center font-body text-base text-ink-400">
            {t("product", "noProducts", locale)}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                name={p.name}
                categoryName={p.category.name}
                imagePath={p.images[0]?.media.path}
                imageAlt={p.images[0]?.media.altText ?? p.images[0]?.media.fileName}
              />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pagination page={page} totalPages={totalPages} basePath="/product" query={query} />
        </div>
      </section>
    </div>
  );
}
