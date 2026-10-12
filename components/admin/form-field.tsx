import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FormFieldProps = {
  /** `id` input; dipakai untuk menghubungkan label dan kontrol. */
  htmlFor: string;
  label: string;
  /** Bila ada, ditampilkan sebagai pesan error di bawah kontrol (aria). */
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

/**
 * Pembungkus field formulir admin: label, kontrol, pesan bantuan/error.
 * Menyediakan `aria-invalid` dan `aria-describedby` secara otomatis.
 */
export function FormField({
  htmlFor,
  label,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="mt-1 text-xs text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1 font-body text-xs text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Input teks admin dengan gaya token Design System. */
export function TextInput({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input className={`input-admin ${className}`} {...props} />;
}

/** Textarea admin. */
export function TextArea({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={`input-admin h-auto min-h-24 py-2 ${className}`}
      {...props}
    />
  );
}

/** Dropdown admin. */
export function Select({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select className={`input-admin ${className}`} {...props}>
      {children}
    </select>
  );
}
