"use client";

import { useActionState } from "react";
import { FormField, TextArea } from "@/components/admin/form-field";
import type { MessageActionState } from "./actions";

const initialState: MessageActionState = {};

/** Formulir catatan internal pesan kontak. */
export function MessageNoteForm({
  action,
  initialNote,
}: {
  action: (prev: MessageActionState, formData: FormData) => Promise<MessageActionState>;
  initialNote: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="panel-card p-6">
      <h2 className="font-heading text-base font-semibold text-ink-900">Catatan internal</h2>
      <p className="mt-1 mb-3 font-body text-sm text-ink-600">
        Hanya terlihat oleh tim admin, tidak dikirim ke pengirim.
      </p>
      {state.error && (
        <p role="alert" className="mb-3 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="mb-3 rounded-sm bg-success/10 px-3 py-2 font-body text-sm text-success">
          Catatan tersimpan.
        </p>
      )}
      <FormField htmlFor="internalNote" label="Catatan">
        <TextArea id="internalNote" name="internalNote" rows={5} maxLength={5000} defaultValue={initialNote} />
      </FormField>
      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan catatan"}
      </button>
    </form>
  );
}
