import { z } from "zod";

/** Skema login (sama dipakai di server action dan validasi klien). */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .toLowerCase()
    .email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  callbackUrl: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Skema pembuatan/pembaruan pengguna admin (Sprint 7 akan memakai penuh). */
export const userSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(200)
    .optional(),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "CS"]),
  isActive: z.coerce.boolean().default(true),
});

export type UserInput = z.infer<typeof userSchema>;
