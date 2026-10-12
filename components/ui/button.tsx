import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "hero" | "outline";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  hero: "btn-hero",
  outline: "btn-outline",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  children: ReactNode;
};

/** Tombol berbasis token Design System. Untuk tautan, pakai `ButtonLink`. */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`${variantClass[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  children: ReactNode;
};

/** Versi tautan dari `Button`. */
export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={`${variantClass[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}