import nodemailer from "nodemailer";
import { env } from "./env";

/** Apakah kredensial SMTP terkonfigurasi (bila tidak, email dilewati + dicatat). */
export function isMailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.MAIL_FROM && env.MAIL_TO);
}

type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Kirim notifikasi email pesan kontak baru (best-effort, retry 2x).
 * Pesan tetap tersimpan walau email gagal — kegagalan hanya dicatat.
 */
export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  id: string;
}): Promise<SendResult> {
  if (!isMailConfigured()) {
    console.warn("[mail] SMTP belum dikonfigurasi — lewati kirim notifikasi kontak.");
    return { ok: false, error: "SMTP belum dikonfigurasi." };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });

  const mail = {
    from: env.MAIL_FROM,
    to: env.MAIL_TO,
    subject: `[Kontak YOFALAB #${input.id}] ${input.subject || "(tanpa subjek)"}`,
    text: `Pesan kontak baru dari ${input.name} <${input.email}>:\n\n${input.message}`,
    replyTo: input.email,
  };

  // ponytail: retry manual 2x tanpa backoff lib; cukup untuk notifikasi best-effort.
  let lastError = "unknown";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await transporter.sendMail(mail);
      return { ok: true };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[mail] Gagal kirim notifikasi kontak (percobaan ${attempt}/2): ${lastError}`);
    }
  }
  return { ok: false, error: lastError };
}
