import type { ReactNode } from "react";

/** Label kategori: huruf kapital kecil, warna sekunder (token label-caps). */
export function CategoryLabel({ children }: { children: ReactNode }) {
  return <span className="label-caps">{children}</span>;
}