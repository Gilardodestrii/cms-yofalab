import { z } from "zod";

/** Skema kategori blog (nama saja; slug otomatis unik). */
export const postCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
});

export type PostCategoryInput = z.infer<typeof postCategorySchema>;

/** Status artikel (selaras enum Prisma `PostStatus`). */
export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export type PostStatusInput = z.infer<typeof postStatusSchema>;

/** Skema utama artikel (konten HTML divalidasi + disanitasi terpisah). */
export const postSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(255),
  categoryId: z.string().trim().optional().default(""),
  excerpt: z.string().max(5000).optional().default(""),
  content: z.string().min(1, "Konten wajib diisi").max(200_000),
  coverMediaId: z.string().trim().optional().default(""),
  status: postStatusSchema.default("DRAFT"),
  /** Tanggal-jam terbit lokal `YYYY-MM-DDTHH:mm`; kosong = sekarang/saat terbit. */
  publishedAt: z.string().trim().optional().default(""),
  seoTitle: z.string().trim().max(190).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
});

export type PostInput = z.infer<typeof postSchema>;
