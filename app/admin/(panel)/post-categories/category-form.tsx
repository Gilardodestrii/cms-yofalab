"use client";

import { useActionState } from "react";
import { FormField, TextInput } from "@/components/admin/form-field";
import type { PostCategoryActionState } from "./actions";

const initialState: PostCategoryActionState = {};

/** Formulir tambah/ubah kategori blog (nama saja; slug otomatis). */
export function PostCategoryForm({
  action,
  initial,
}: {
  action: (
    prev: PostCategoryActionState,
    formData: FormData,
  ) => Promise<PostCategoryActionState>;
  initial?: { name?: string };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="panel-card max-w-2xl p-6">
      {state.error && (
        <p role="alert" className="mb-4 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {state.error}
        </p>
      )}
      <FormField htmlFor="name" label="Nama kategori" required error={state.fieldErrors?.name}>
        <TextInput id="name" name="name" required maxLength={120} defaultValue={initial?.name ?? ""} />
      </FormField>
      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan kategori"}
      </button>
    </form>
  );
}
