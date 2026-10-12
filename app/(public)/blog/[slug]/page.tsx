import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { PublicBreadcrumb } from "@/components/ui/public-breadcrumb";
import { PostCard } from "@/components/ui/post-card";
import { CommentForm } from "@/components/ui/comment-form";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Metadata SEO artikel (aman saat DB belum siap). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let post: {
    title: string;
    excerpt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    cover: { path: string } | null;
  } | null = null;
  try {
    post = await db.post.findFirst({
      where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: {
        title: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        cover: { select: { path: true } },
      },
    });
  } catch {
    post = null;
  }
  if (!post) return { title: "Artikel tidak ditemukan" };

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      type: "article",
      images: post.cover?.path ? [post.cover.path] : undefined,
    },
  };
}

/** Detail artikel publik: konten, penulis + tanggal, komentar disetujui, artikel terkait. */
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.post
    .findFirst({
      where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true,
        seoTitle: true,
        seoDescription: true,
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        cover: { select: { path: true, fileName: true, altText: true } },
      },
    })
    .catch(() => null);

  if (!post) notFound();

  const [comments, related] = await Promise.all([
    db.comment.findMany({
      where: { postId: post.id, status: "APPROVED" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, website: true, body: true, createdAt: true },
    }),
    db.post.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        id: { not: post.id },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        category: { select: { name: true } },
        cover: { select: { path: true, fileName: true, altText: true } },
      },
    }),
  ]);

  // Sanitasi ulang saat tampil: konten lama/sebelum perbaikan tetap aman.
  const safeContent = sanitizeHtml(post.content);

  return (
    <div>
      <section className="bg-coral">
        <div className="container-site py-10 text-center">
          {post.category && <p className="font-heading text-xs font-semibold uppercase tracking-wide text-white/80">{post.category.name}</p>}
          <h1 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">{post.title}</h1>
          <p className="mt-3 font-body text-sm text-white/80">
            {post.author.name} · {formatDate(post.publishedAt)}
          </p>
          <div className="mt-2 flex justify-center [&_a]:!text-white [&_span]:!text-white/80">
            <PublicBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
          </div>
        </div>
      </section>

      <article className="container-site py-10 md:py-14">
        {post.cover && (
          <div className="mx-auto mb-8 max-w-3xl overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover.path}
              alt={post.cover.altText ?? post.cover.fileName}
              className="w-full object-cover"
            />
          </div>
        )}
        <div
          className="prose-yofa mx-auto max-w-reading font-body text-base text-ink-600"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* Komentar */}
        <section className="mx-auto mt-12 max-w-reading border-t border-line pt-8">
          <h2 className="font-heading text-xl font-semibold text-ink-900">
            Komentar {comments.length > 0 && `(${comments.length})`}
          </h2>
          {comments.length === 0 ? (
            <p className="mt-3 font-body text-sm text-ink-400">Belum ada komentar yang disetujui.</p>
          ) : (
            <ul className="mt-5 flex flex-col gap-5">
              {comments.map((c) => (
                <li key={c.id.toString()} className="rounded-sm border border-line bg-surface p-4">
                  <p className="font-heading text-sm font-semibold text-ink-900">
                    {c.website ? (
                      <a href={c.website} rel="nofollow noopener noreferrer" target="_blank" className="hover:text-brand-600">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </p>
                  <p className="font-body text-xs text-ink-400">{formatDate(c.createdAt)}</p>
                  <div
                    className="prose-yofa mt-2 font-body text-sm text-ink-600"
                    dangerouslySetInnerHTML={{ __html: c.body }}
                  />
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-10 font-heading text-lg font-semibold text-ink-900">Tinggalkan komentar</h3>
          <p className="mt-1 mb-4 font-body text-sm text-ink-400">
            Komentar tampil setelah disetujui moderator.
          </p>
          <CommentForm postId={post.id.toString()} />
        </section>
      </article>

      {related.length > 0 && (
        <section className="container-site pb-16">
          <h2 className="text-center font-heading text-2xl font-semibold text-ink-900">Artikel lain</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
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
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Person", name: post.author.name },
            image: post.cover?.path,
            description: post.seoDescription ?? post.excerpt ?? undefined,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteConfig.url}/blog/${post.slug}`,
            },
            publisher: { "@id": `${siteConfig.url}/#organization` },
          }),
        }}
      />
    </div>
  );
}
