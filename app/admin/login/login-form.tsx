"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { FormField, TextInput } from "@/components/admin/form-field";

const initialState: LoginState = {};

/**
 * Formulir login admin. Memakai `useActionState` untuk menampilkan pesan error
 * dari server action tanpa JavaScript tambahan.
 */
export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} noValidate>
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}
      <FormField htmlFor="email" label="Email" required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={state.error ? true : undefined}
        />
      </FormField>
      <FormField htmlFor="password" label="Kata sandi" required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
        />
      </FormField>

      {state.error && (
        <p role="alert" className="mb-4 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-admin w-full" disabled={pending}>
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}