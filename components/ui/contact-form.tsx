"use client";

import { useState } from "react";
import { FormField, TextArea, TextInput } from "@/components/admin/form-field";

/** Formulir kontak publik (kirim JSON ke `/api/contact`). */
export function ContactForm() {
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        setError(json.error ?? "Gagal mengirim pesan.");
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
        Pesan terkirim. Tim kami akan menghubungi Anda segera.
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
        <FormField htmlFor="k-name" label="Nama" required error={fieldErrors.name}>
          <TextInput id="k-name" name="name" required maxLength={120} />
        </FormField>
        <FormField htmlFor="k-email" label="Email" required error={fieldErrors.email}>
          <TextInput id="k-email" name="email" type="email" required maxLength={190} />
        </FormField>
      </div>
      <FormField htmlFor="k-subject" label="Subjek" error={fieldErrors.subject}>
        <TextInput id="k-subject" name="subject" maxLength={200} />
      </FormField>
      <FormField htmlFor="k-message" label="Pesan" required error={fieldErrors.message}>
        <TextArea id="k-message" name="message" rows={6} required maxLength={10000} />
      </FormField>
      {/* Honeypot: disembunyikan dari pengguna, tetap diisi bot. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="k-company">Jangan diisi</label>
        <input id="k-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn-admin self-start" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim pesan"}
      </button>
    </form>
  );
}
