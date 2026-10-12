import Link from "next/link";

/** Kartu produk publik: gambar, nama, kategori, tombol Read more. */
export function ProductCard({
  slug,
  name,
  categoryName,
  imagePath,
  imageAlt,
}: {
  slug: string;
  name: string;
  categoryName: string;
  imagePath?: string | null;
  imageAlt?: string | null;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-md bg-surface shadow-card transition-shadow duration-150 hover:shadow-card-hover">
      <Link
        href={`/product/${slug}`}
        className="flex aspect-square items-center justify-center bg-surface-muted"
        aria-label={`Lihat detail ${name}`}
      >
        {imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePath}
            alt={imageAlt ?? name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden="true" className="font-heading text-4xl text-ink-400">
            ▣
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col items-center gap-1 p-4 text-center">
        <p className="label-caps">{categoryName}</p>
        <h3 className="font-heading text-base font-semibold text-ink-900">
          <Link href={`/product/${slug}`} className="hover:text-brand-600">
            {name}
          </Link>
        </h3>
        <span aria-hidden="true" className="my-1 h-px w-10 bg-line" />
        <Link
          href={`/product/${slug}`}
          className="font-body text-sm font-semibold text-brand-600 hover:text-brand-600"
        >
          Read more
        </Link>
      </div>
    </article>
  );
}
