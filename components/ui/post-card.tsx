import Link from "next/link";

/** Kartu artikel blog publik: gambar utama, kategori, judul, ringkasan, tanggal. */
export function PostCard({
  slug,
  title,
  excerpt,
  categoryName,
  dateLabel,
  imagePath,
  imageAlt,
}: {
  slug: string;
  title: string;
  excerpt?: string | null;
  categoryName?: string | null;
  dateLabel?: string;
  imagePath?: string | null;
  imageAlt?: string | null;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-line bg-surface">
      <Link href={`/blog/${slug}`} className="block aspect-[16/9] overflow-hidden bg-surface-muted">
        {imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePath}
            alt={imageAlt ?? title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-heading text-4xl text-ink-400" aria-hidden="true">
            ✎
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {categoryName && <p className="label-caps">{categoryName}</p>}
        <h2 className="mt-2 font-heading text-lg font-semibold text-ink-900">
          <Link href={`/blog/${slug}`} className="hover:text-brand-600">
            {title}
          </Link>
        </h2>
        {excerpt && (
          <p className="mt-2 flex-1 font-body text-sm text-ink-600 line-clamp-3">{excerpt}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          {dateLabel && <span className="font-body text-xs text-ink-400">{dateLabel}</span>}
          <Link href={`/blog/${slug}`} className="font-heading text-xs font-semibold uppercase tracking-wide text-brand-600 hover:text-brand-700">
            Baca →
          </Link>
        </div>
      </div>
    </article>
  );
}
