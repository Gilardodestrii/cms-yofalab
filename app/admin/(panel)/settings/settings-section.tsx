"use client";

import { useActionState } from "react";
import { FormField, TextArea, TextInput } from "@/components/admin/form-field";
import type { SettingsActionState } from "./actions";

const initialState: SettingsActionState = {};

type Action = (
  prev: SettingsActionState,
  formData: FormData,
) => Promise<SettingsActionState>;

/** Panel formulir pengaturan: judul, aksi, pesan sukses/error, field. */
export function SettingsSection({
  title,
  description,
  action,
  submitLabel = "Simpan",
  children,
}: {
  title: string;
  description?: string;
  action: Action;
  submitLabel?: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="panel-card p-6">
      <h2 className="font-heading text-base font-semibold text-ink-900">{title}</h2>
      {description && (
        <p className="mt-1 mb-4 font-body text-sm text-ink-600">{description}</p>
      )}
      {state.error && (
        <p role="alert" className="mb-4 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="mb-4 rounded-sm bg-success/10 px-3 py-2 font-body text-sm text-success">
          Pengaturan tersimpan.
        </p>
      )}
      {children}
      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : submitLabel}
      </button>
    </form>
  );
}

export { FormField, TextArea, TextInput };
