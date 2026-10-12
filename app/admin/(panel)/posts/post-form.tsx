"use client";

import { useActionState, useState } from "react";
import { FormField, Select, TextArea, TextInput } from "@/components/admin/form-field";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { PostActionState } from "./actions";

const initialState: PostActionState = {};

export type PostFormInitial = {
  title?: string;
  categoryId?: string;
  excerpt?: string;
  content?: string;
  coverMediaId?: string;
  coverName?: string;
  status?: "DRAFT" | "PUBLISHED";
  /** Nilai `datetime-local` (YYYY-MM-DDTHH:mm). */
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
};

function toDatetimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Formulir tambah/ubah artikel: judul, kategori, ringkasan, konten Tiptap,
 * gambar utama (MediaPicker), status, jadwal terbit, SEO.
 */
export function PostForm({
  action,
  categories,
  initial,
}: {
  action: (prev: PostActionState, formData: FormData) => Promise<PostActionState>;
  categories: { id: string; name: string }[];
  initial?: PostFormInitial;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [cover, setCover] = useState<MediaItem | null>(
    initial?.coverMediaId
      ? { id: initial.coverMediaId, path: "", fileName: initial.coverName ?? "", altText: null, mimeType: "image/" }
      : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <form action={formAction} noValidate className="flex max-w-3xl flex-col gap-2">
      {state.error && (
        <p role="alert" className="mb-2 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
          {state.error}
        </p>
      )}

      <FormField htmlFor="title" label="Judul" required error={state.fieldErrors?.title}>
        <TextInput id="title" name="title" required maxLength={255} defaultValue={initial?.title ?? ""} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="categoryId" label="Kategori" error={state.fieldErrors?.categoryId}>
          <Select id="categoryId" name="categoryId" defaultValue={initial?.categoryId ?? ""}>
            <option value="">— Tanpa kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField htmlFor="status" label="Status" required error={state.fieldErrors?.status}>
          <Select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </FormField>
      </div>

      <FormField
        htmlFor="publishedAt"
        label="Jadwal terbit"
        hint="Kosongkan: terbit sekarang bila Published, tanpa jadwal bila Draft. Artikel Published bertanggal masa depan tidak tampil sampai waktunya."
        error={state.fieldErrors?.publishedAt}
      >
        <TextInput
          id="publishedAt"
          name="publishedAt"
          type="datetime-local"
          defaultValue={initial?.publishedAt ?? ""}
        />
      </FormField>

      <FormField htmlFor="excerpt" label="Ringkasan (excerpt)" hint="Opsional; dipakai kartu blog dan meta deskripsi cadangan." error={state.fieldErrors?.excerpt}>
        <TextArea id="excerpt" name="excerpt" rows={3} maxLength={5000} defaultValue={initial?.excerpt ?? ""} />
      </FormField>

      <FormField htmlFor="content" label="Konten" required error={state.fieldErrors?.content}>
        <RichTextEditor name="content" initial={initial?.content ?? ""} />
      </FormField>

      <FormField htmlFor="coverMediaId" label="Gambar utama" hint="Pilih gambar dari pustaka media (opsional)." error={state.fieldErrors?.coverMediaId}>
        <input type="hidden" id="coverMediaId" name="coverMediaId" value={cover?.id ?? ""} />
        <div className="flex items-center gap-3">
          {cover?.path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.path} alt={cover.fileName} className="h-16 w-24 rounded-sm border border-line object-cover" />
          ) : (
            <span className="font-body text-sm text-ink-600">{cover ? cover.fileName : "Belum ada gambar."}</span>
          )}
          <button type="button" className="btn-admin-secondary h-8 px-3 text-xs" onClick={() => setPickerOpen(true)}>
            {cover ? "Ganti gambar" : "Pilih gambar"}
          </button>
          {cover && (
            <button type="button" className="font-body text-xs text-danger hover:underline" onClick={() => setCover(null)}>
              Hapus
            </button>
          )}
        </div>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="seoTitle" label="SEO title" hint="Opsional; default = judul." error={state.fieldErrors?.seoTitle}>
          <TextInput id="seoTitle" name="seoTitle" maxLength={190} defaultValue={initial?.seoTitle ?? ""} />
        </FormField>
        <FormField htmlFor="seoDescription" label="SEO description" hint="Opsional." error={state.fieldErrors?.seoDescription}>
          <TextInput id="seoDescription" name="seoDescription" maxLength={320} defaultValue={initial?.seoDescription ?? ""} />
        </FormField>
      </div>

      <div>
        <button type="submit" className="btn-admin" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan artikel"}
        </button>
      </div>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(m) => setCover(m)} />
    </form>
  );
}

/** Helper ekspor agar halaman edit bisa normalisasi `publishedAt` Date → input. */
export { toDatetimeLocal };
