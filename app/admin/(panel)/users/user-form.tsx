"use client";

import { useActionState } from "react";
import { FormField, Select, TextInput } from "@/components/admin/form-field";
import { ROLES, roleLabels } from "@/lib/auth/roles";
import type { UserActionState } from "./actions";

const initialState: UserActionState = {};

/** Formulir tambah/ubah pengguna admin. */
export function UserForm({
  action,
  initial,
}: {
  action: (prev: UserActionState, formData: FormData) => Promise<UserActionState>;
  initial?: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isEdit = Boolean(initial);

  return (
    <form action={formAction} noValidate className="panel-card max-w-2xl p-6">
      {state.error && (
        <p role="alert" className="mb-4 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {state.error}
        </p>
      )}

      <FormField htmlFor="name" label="Nama" required error={state.fieldErrors?.name}>
        <TextInput id="name" name="name" required maxLength={120} defaultValue={initial?.name ?? ""} />
      </FormField>

      <FormField htmlFor="email" label="Email" required error={state.fieldErrors?.email}>
        <TextInput id="email" name="email" type="email" required defaultValue={initial?.email ?? ""} />
      </FormField>

      <FormField
        htmlFor="password"
        label={isEdit ? "Kata sandi baru (opsional)" : "Kata sandi"}
        required={!isEdit}
        hint={isEdit ? "Biarkan kosong bila tidak ingin mengganti kata sandi." : "Minimal 8 karakter."}
        error={state.fieldErrors?.password}
      >
        <TextInput
          id="password"
          name="password"
          type="password"
          required={!isEdit}
          minLength={8}
          maxLength={200}
          autoComplete="new-password"
        />
      </FormField>

      <FormField htmlFor="role" label="Peran" required error={state.fieldErrors?.role}>
        <Select id="role" name="role" defaultValue={initial?.role ?? "EDITOR"}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField htmlFor="isActive" label="Status akun">
        <label className="flex items-center gap-2 font-body text-sm text-ink-600">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={initial ? initial.isActive : true}
            className="h-4 w-4 rounded-sm border-line text-brand-600 focus:ring-brand-500"
          />
          Aktif (dapat login)
        </label>
      </FormField>

      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan pengguna"}
      </button>
    </form>
  );
}
