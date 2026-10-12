"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";

export type LoginState = {
  error?: string;
};

/**
 * Server action login. Memvalidasi input di server (Zod), lalu menyerahkan
 * ke Auth.js Credentials. Mengembalikan pesan error generik agar tidak
 * membocorkan apakah email terdaftar atau tidak.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Input tidak valid" };
  }

  const { email, password, callbackUrl } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // Auth.js melempar redirect juga; hanya tangani error kredensial di sini.
      if (error.type === "CredentialsSignin") {
        return { error: "Email atau kata sandi salah, atau akun tidak aktif." };
      }
    }
    // RedirectError (sukses) harus dilempar ulang agar navigasi berjalan.
    throw error;
  }
}
