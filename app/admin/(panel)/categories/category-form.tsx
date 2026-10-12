"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  FormField,
  TextInput,
} from "@/components/admin/form-field";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";
import type { CategoryActionState } from "./actions";

const initialState: CategoryActionState = {};

type CategoryFormValues = {
  name?: string;
  imageMediaId?: string;
  imagePreview?: string;
  imageName?: string;
  sortOrder?: number;
};

/**
 * Formulir tambah/ubah kategori: nama, gambar (media picker), urutan.
 * Dipakai di `/admin/categories/new` dan `/admin/categories/[id]/edit`.
 */
export function CategoryForm({
  action,
  initial,
}: {
  action: (
    prev: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  initial?: CategoryFormValues;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [image, setImage] = useState<MediaItem | null>(
    initial?.imageMediaId
      ? {
          id: initial.imageMediaId,
          path: initial.imagePreview ?? "",
          fileName: initial.imageName ?? "",
          altText: null,
          mimeType: "",
        }
      : null,
  );

  const onSelect = (media: MediaItem) => setImage(media);

  return (
    <form action={formAction} noValidate className="panel-card max-w-2xl p-6">
      {state.error && (
        <p
          role="alert"
          className="mb-4 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <FormField
        htmlFor="name"
        label="Nama kategori"
        required
        error={state.fieldErrors?.name}
      >
        <TextInput
          id="name"
          name="name"
          required
          maxLength={150}
          defaultValue={initial?.name ?? ""}
          placeholder="mis. Hemoglobin Meter"
        />
      </FormField>

      <FormField
        htmlFor="imageMediaId"
        label="Gambar"
        hint="Pilih dari pustaka media (opsional)."
        error={state.fieldErrors?.imageMediaId}
      >
        <input
          type="hidden"
          id="imageMediaId"
          name="imageMediaId"
          value={image?.id ?? ""}
        />
        <div className="flex items-center gap-3">
          {image?.path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.path}
              alt={image.fileName}
              className="h-16 w-16 rounded-sm border border-line object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-sm border border-line bg-surface-muted font-body text-xs text-ink-400">
              Kosong
            </span>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn-admin-secondary h-8 px-3 text-xs"
              onClick={() => setPickerOpen(true)}
            >
              {image ? "Ganti gambar" : "Pilih gambar"}
            </button>
            {image && (
              <button
                type="button"
                className="h-8 px-3 font-body text-xs text-danger hover:underline"
                onClick={() => setImage(null)}
              >
                Hapus gambar
              </button>
            )}
          </div>
        </div>
      </FormField>

      <FormField
        htmlFor="sortOrder"
        label="Urutan"
        hint="Angka kecil tampil lebih dulu."
        error={state.fieldErrors?.sortOrder}
      >
        <TextInput
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={initial?.sortOrder ?? 0}
          className="w-32"
        />
      </FormField>

      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan kategori"}
      </button>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
      />
    </form>
  );
}
