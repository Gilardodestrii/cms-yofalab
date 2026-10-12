"use client";

import { useState } from "react";
import { FormField, TextArea, TextInput } from "@/components/admin/form-field";

/** Formulir komentar publik (kirim JSON ke `/api/comments`, status PENDING). */
export function CommentForm({ postId }: { postId: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setPending(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, postId }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (res.ok && json.ok) {
        setDone(true);
        form.reset();
      } else {
        setError(json.error ?? "Gagal mengirim komentar.");
        setFieldErrors(json.fieldErrors ?? {});
      }
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <p role="status" className="rounded-sm bg-success/10 px-4 py-3 font-body text-sm text-success">
        Terima kasih. Komentar Anda menunggu moderasi sebelum tampil.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col">
      {error && (
        <p role="alert" className="mb-3 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField htmlFor="c-name" label="Nama" required error={fieldErrors.name}>
          <TextInput id="c-name" name="name" required maxLength={120} />
        </FormField>
        <FormField htmlFor="c-email" label="Email" required hint="Tidak dipublikasikan." error={fieldErrors.email}>
          <TextInput id="c-email" name="email" type="email" required maxLength={190} />
        </FormField>
      </div>
      <FormField htmlFor="c-website" label="Situs (opsional)" error={fieldErrors.website}>
        <TextInput id="c-website" name="website" maxLength={255} placeholder="https://" />
      </FormField>
      <FormField htmlFor="c-body" label="Komentar" required error={fieldErrors.body}>
        <TextArea id="c-body" name="body" rows={5} required maxLength={5000} />
      </FormField>
      {/* Honeypot: disembunyikan dari pengguna, tetap diisi bot. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="c-website2">Jangan diisi</label>
        <input id="c-website2" name="website2" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn-admin self-start" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim komentar"}
      </button>
    </form>
  );
}
