import Link from "next/link";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb admin: label 12 px huruf kapital, pemisah "/".
 * Tautan brand-500, halaman aktif ink-900.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 font-heading text-xs font-semibold uppercase tracking-wide">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="text-brand-600">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink-900">{item.label}</span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-ink-400">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}