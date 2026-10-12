import { z } from "zod";

/** Formulir kontak publik: honeypot (`company`) harus kosong. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  email: z.string().trim().email("Email tidak valid").max(190),
  subject: z.string().trim().max(200).default(""),
  message: z.string().trim().min(1, "Pesan wajib diisi").max(10_000),
  /** Honeypot anti-bot: pengguna nyata tidak melihat/mengisi field ini. */
  company: z.string().max(200).default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Formulir komentar publik: honeypot (`website2`) harus kosong. */
export const commentSchema = z.object({
  postId: z.string().trim().min(1, "Artikel tidak valid"),
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  email: z.string().trim().email("Email tidak valid").max(190),
  /** Tautan situs opsional milik komentator (boleh kosong). */
  website: z.string().trim().max(255).default(""),
  body: z.string().trim().min(1, "Komentar wajib diisi").max(5000),
  /** Honeypot anti-bot. */
  website2: z.string().max(200).default(""),
});

export type CommentInput = z.infer<typeof commentSchema>;
