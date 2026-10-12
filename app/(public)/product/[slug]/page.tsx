import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { ProductCard } from "@/components/ui/product-card";
import { Tabs } from "@/components/ui/tabs";
import { getContactSetting, whatsappLink } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let product: { name: string; seoTitle: string | null; seoDescription: string | null; shortDescription: string | null } | null = null;
  try {
    product = await db.product.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { name: true, seoTitle: true, seoDescription: true, shortDescription: true },
    });
  } catch {
    // Database belum siap saat build: metadata generik.
  }
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || `Detail produk ${product.name} YOFALAB Indonesia.`,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      type: "website",
      title: product.seoTitle || product.name,
      description:
        product.seoDescription ||
        product.shortDescription ||
        `Detail produk ${product.name} YOFALAB Indonesia.`,
    },
  };
}

/** Detail produk publik: galeri, tab Description, brosur, produk terkait. */
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        include: { media: { select: { path: true, fileName: true, altText: true } } },
      },
      brochure: { select: { path: true, fileName: true } },
      productTags: { include: { tag: { select: { name: true } } } },
      relatedFrom: {
        orderBy: { sortOrder: "asc" },
        take: 5,
        include: {
          relatedProduct: {
            select: {
              name: true,
              slug: true,
              status: true,
              category: { select: { name: true } },
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { media: { select: { path: true, fileName: true, altText: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!product) notFound();

  const waLink = whatsappLink((await getContactSetting()).whatsapp);

  // Terkait manual bila ada, bila kosong otomatis dari kategori sama.
  const manual = product.relatedFrom
    .map((r) => r.relatedProduct)
    .filter((p) => p.status === "PUBLISHED");
  let related = manual;
  if (related.length === 0) {
    related = await db.product.findMany({
      where: { status: "PUBLISHED", categoryId: product.categoryId, id: { not: product.id } },
      orderBy: { sortOrder: "asc" },
      take: 5,
      select: {
        name: true,
        slug: true,
        status: true,
        category: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { media: { select: { path: true, fileName: true, altText: true } } },
        },
      },
    });
  }

  const specs = Array.isArray(product.specifications)
    ? (product.specifications as { key: string; value: string }[])
    : [];
  const apps = Array.isArray(product.applications)
    ? (product.applications as string[])
    : [];
  const primary = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <div>
      <section className="container-site py-8">
        <PublicBreadcrumb
          align="left"
          items={[
            { label: "Home", href: "/" },
            { label: "Product", href: "/product" },
            { label: product.name },
          ]}
        />
      </section>

      <section className="container-site grid gap-10 pb-14 md:grid-cols-12">
        {/* Galeri gambar 5/12 */}
        <div className="md:col-span-5">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primary.media.path} alt={primary.media.altText ?? primary.media.fileName} className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden="true" className="font-heading text-6xl text-ink-400">▣</span>
            )}
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {product.images.map((img) => (
                <li key={img.id.toString()} className="flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.media.path} alt={img.media.altText ?? img.media.fileName} loading="lazy" className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Informasi 7/12 */}
        <div className="md:col-span-7">
          <h1 className="font-heading text-3xl font-bold text-ink-900">{product.name}</h1>
          <p className="label-caps mt-2">{product.category.name}</p>
          {product.shortDescription && (
            <p className="mt-4 font-body text-lg text-ink-600">{product.shortDescription}</p>
          )}
          {product.productTags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tag produk">
              {product.productTags.map((t) => (
                <li key={t.tag.name} className="rounded-full bg-brand-50 px-3 py-1 font-body text-xs text-brand-700">
                  {t.tag.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {product.brochure && (
              <a href={product.brochure.path} download className="btn-outline">
                Download Brosur
              </a>
            )}
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
                WhatsApp
              </a>
            ) : null}
            <Link href="/contact" className="btn-primary h-12 px-6 text-base">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Tab Description */}
      <section className="container-site pb-14">
        <Tabs
          tabs={[
            {
              label: "Description",
              content: (
                <div className="flex flex-col gap-8">
                  {specs.length > 0 && (
                    <div>
                      <h2 className="font-heading text-xl font-semibold text-ink-900">Specifications</h2>
                      <ul className="mt-3 flex flex-col gap-2">
                        {specs.map((s, i) => (
                          <li key={i} className="flex gap-2 font-body text-base text-ink-600">
                            <span aria-hidden="true" className="text-brand-600">•</span>
                            <span><strong className="text-ink-900">{s.key}:</strong> {s.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {apps.length > 0 && (
                    <div>
                      <h2 className="font-heading text-xl font-semibold text-ink-900">Applications</h2>
                      <ul className="mt-3 flex flex-col gap-2">
                        {apps.map((a, i) => (
                          <li key={i} className="flex gap-2 font-body text-base text-ink-600">
                            <span aria-hidden="true" className="text-brand-600">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {specs.length === 0 && apps.length === 0 && (
                    <p className="font-body text-base text-ink-400">Belum ada spesifikasi untuk produk ini.</p>
                  )}
                </div>
              ),
            },
          ]}
        />
        {product.brochure && (
          <div className="mt-6 text-center">
            <a href={product.brochure.path} download className="btn-outline">
              Download Brosur
            </a>
          </div>
        )}
      </section>

      {/* Produk terkait */}
      {related.length > 0 && (
        <section className="container-site pb-16">
          <h2 className="text-center font-heading text-2xl font-semibold text-ink-900">
            Related products
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {related.slice(0, 5).map((p) => (
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
        </section>
      )}

      {/* JSON-LD Product untuk SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.shortDescription ?? undefined,
            category: product.category.name,
            image: primary?.media.path,
            url: `${siteConfig.url}/product/${product.slug}`,
            brand: { "@type": "Brand", name: siteConfig.name },
          }),
        }}
      />
    </div>
  );
}
