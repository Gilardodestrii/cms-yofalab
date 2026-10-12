import type { ReactNode } from "react";

type Variant = "brand" | "success" | "warning" | "danger" | "info";

const variantClass: Record<Variant, string> = {
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-ink-900",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

/** Lencana status kecil (pill) berbasis token Design System. */
export function Badge({
  variant = "brand",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-xs font-semibold ${variantClass[variant]}`}
    >
      {children}
    </span>
  );
}
