import Link from "next/link";

/** Breadcrumb publik: tautan brand-500, halaman aktif ink-900. */
export function PublicBreadcrumb({
  items,
  align = "center",
}: {
  items: { label: string; href?: string }[];
  align?: "center" | "left";
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`font-heading text-xs font-semibold uppercase tracking-wide ${align === "center" ? "text-center" : "text-left"}`}
    >
      <ol className={`flex flex-wrap gap-1 ${align === "center" ? "justify-center" : "justify-start"}`}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="text-ink-400">/</span>
              )}
              {item.href && !last ? (
                <Link href={item.href} className="text-brand-500 hover:text-brand-600">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-ink-900">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
