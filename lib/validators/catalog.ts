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

/** Status produk (selaras enum Prisma `ProductStatus`). */
export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export type ProductStatusInput = z.infer<typeof productStatusSchema>;

/** Satu baris spesifikasi key-value (disimpan sebagai JSON di `products.specifications`). */
export const productSpecItemSchema = z.object({
  key: z.string().trim().min(1, "Kunci spesifikasi wajib diisi").max(100),
  value: z.string().trim().min(1, "Nilai spesifikasi wajib diisi").max(500),
});

/** Daftar spesifikasi produk: maks 50 baris key-value. */
export const productSpecificationsSchema = z
  .array(productSpecItemSchema)
  .max(50, "Maksimal 50 baris spesifikasi")
  .default([]);

/** Daftar aplikasi/penggunaan produk: maks 50 item teks. */
export const productApplicationsSchema = z
  .array(z.string().trim().min(1, "Aplikasi tidak boleh kosong").max(300))
  .max(50, "Maksimal 50 aplikasi")
  .default([]);

/** Skema utama produk (field skalar; relasi/galeri/JSON divalidasi terpisah). */
export const productSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(200),
  categoryId: z.string().trim().min(1, "Kategori wajib dipilih"),
  shortDescription: z.string().max(5000).optional().default(""),
  status: productStatusSchema.default("DRAFT"),
  sortOrder: z.coerce.number().int().min(0).max(999999).default(0),
  seoTitle: z.string().trim().max(190).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
  brochureMediaId: z.string().trim().optional().default(""),
  /** Tag sebagai string koma; diurai di server action. */
  tags: z.string().max(2000).optional().default(""),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductSpecItem = z.infer<typeof productSpecItemSchema>;
