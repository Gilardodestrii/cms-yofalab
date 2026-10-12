import { z } from "zod";

/** Buat slug URL dari nama: huruf kecil, non-alfanumerik jadi strip. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190);
}

/** Skema kategori produk (nama, gambar opsional via media picker, urutan). */
export const productCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(150),
  imageMediaId: z.string().trim().optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(999999).default(0),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;
