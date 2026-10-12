"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  FormField,
  Select,
  TextArea,
  TextInput,
} from "@/components/admin/form-field";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";
import type { ProductActionState } from "./actions";

const initialState: ProductActionState = {};

export type CategoryOption = { id: string; name: string };

export type RelatedOption = { id: string; name: string };

export type ProductFormInitial = {
  name?: string;
  categoryId?: string;
  shortDescription?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  brochureMediaId?: string;
  brochureName?: string;
  tagNames?: string;
  specifications?: { key: string; value: string }[];
  applications?: string[];
  imageIds?: string[];
  imagePreviews?: { id: string; path: string; fileName: string }[];
  primaryImageId?: string;
  relatedIds?: string[];
};

/**
 * Formulir tambah/ubah produk: field skalar + spesifikasi/aplikasi dinamis +
 * galeri/brosur via media picker + tag koma + produk terkait.
 */
export function ProductForm({
  action,
  categories,
  relatedOptions,
  initial,
}: {
  action: (
    prev: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
  categories: CategoryOption[];
  relatedOptions: RelatedOption[];
  initial?: ProductFormInitial;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initial?.specifications ?? [],
  );
  const [apps, setApps] = useState<string[]>(initial?.applications ?? []);
  const [images, setImages] = useState<
    { id: string; path: string; fileName: string }[]
  >(initial?.imagePreviews ?? []);
  const [primaryId, setPrimaryId] = useState(initial?.primaryImageId ?? "");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [brochure, setBrochure] = useState<MediaItem | null>(
    initial?.brochureMediaId
      ? {
          id: initial.brochureMediaId,
          path: "",
          fileName: initial.brochureName ?? "",
          altText: null,
          mimeType: "",
        }
      : null,
  );
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [relatedIds, setRelatedIds] = useState<string[]>(initial?.relatedIds ?? []);

  const addSpec = () => setSpecs((prev) => [...prev, { key: "", value: "" }]);
  const addApp = () => setApps((prev) => [...prev, ""]);

  const onSelectGallery = (media: MediaItem) => {
    setImages((prev) => {
      if (prev.some((m) => m.id === media.id)) return prev;
      return [...prev, { id: media.id, path: media.path, fileName: media.fileName }];
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((m) => m.id !== id));
    if (primaryId === id) setPrimaryId("");
  };

  const toggleRelated = (id: string) => {
    setRelatedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  return (
    <form action={formAction} noValidate className="flex max-w-3xl flex-col gap-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <div className="panel-card p-6">
        <h2 className="font-heading text-base font-semibold text-ink-900">Dasar</h2>
        <div className="mt-4">
          <FormField htmlFor="name" label="Nama produk" required error={state.fieldErrors?.name}>
            <TextInput id="name" name="name" required maxLength={200} defaultValue={initial?.name ?? ""} />
          </FormField>
          <FormField htmlFor="categoryId" label="Kategori" required error={state.fieldErrors?.categoryId}>
            <Select id="categoryId" name="categoryId" required defaultValue={initial?.categoryId ?? ""}>
              <option value="">— Pilih kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="shortDescription" label="Deskripsi singkat" error={state.fieldErrors?.shortDescription}>
            <TextArea id="shortDescription" name="shortDescription" defaultValue={initial?.shortDescription ?? ""} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="status" label="Status" required error={state.fieldErrors?.status}>
              <Select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Arsip</option>
              </Select>
            </FormField>
            <FormField htmlFor="sortOrder" label="Urutan" error={state.fieldErrors?.sortOrder}>
              <TextInput id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={initial?.sortOrder ?? 0} className="w-32" />
            </FormField>
          </div>
        </div>
      </div>

      <div className="panel-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-ink-900">Spesifikasi</h2>
          <button type="button" className="btn-admin-secondary h-8 px-3 text-xs" onClick={addSpec}>
            Tambah baris
          </button>
        </div>
        <input type="hidden" name="specifications" value={JSON.stringify(specs.filter((s) => s.key.trim() && s.value.trim()))} />
        {specs.length === 0 && (
          <p className="mt-3 font-body text-sm text-ink-400">Belum ada spesifikasi.</p>
        )}
        {specs.map((s, i) => (
          <div key={i} className="mt-3 flex gap-2">
            <input
              aria-label={`Kunci spesifikasi ${i + 1}`}
              className="input-admin"
              placeholder="Label"
              value={s.key}
              onChange={(e) => setSpecs((prev) => prev.map((row, j) => (j === i ? { ...row, key: e.target.value } : row)))}
            />
            <input
              aria-label={`Nilai spesifikasi ${i + 1}`}
              className="input-admin"
              placeholder="Nilai"
              value={s.value}
              onChange={(e) => setSpecs((prev) => prev.map((row, j) => (j === i ? { ...row, value: e.target.value } : row)))}
            />
            <button
              type="button"
              aria-label={`Hapus spesifikasi ${i + 1}`}
              className="px-2 font-body text-sm text-danger hover:underline"
              onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
        {state.fieldErrors?.specifications && (
          <p role="alert" className="mt-2 font-body text-xs text-danger">{state.fieldErrors.specifications}</p>
        )}
      </div>

      <div className="panel-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-ink-900">Aplikasi</h2>
          <button type="button" className="btn-admin-secondary h-8 px-3 text-xs" onClick={addApp}>
            Tambah aplikasi
          </button>
        </div>
        <input type="hidden" name="applications" value={JSON.stringify(apps.filter((a) => a.trim()))} />
        {apps.length === 0 && (
          <p className="mt-3 font-body text-sm text-ink-400">Belum ada aplikasi.</p>
        )}
        {apps.map((a, i) => (
          <div key={i} className="mt-3 flex gap-2">
            <input
              aria-label={`Aplikasi ${i + 1}`}
              className="input-admin"
              placeholder="mis. Anemia screening"
              value={a}
              onChange={(e) => setApps((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <button
              type="button"
              aria-label={`Hapus aplikasi ${i + 1}`}
              className="px-2 font-body text-sm text-danger hover:underline"
              onClick={() => setApps((prev) => prev.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="panel-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-ink-900">Galeri</h2>
          <button type="button" className="btn-admin-secondary h-8 px-3 text-xs" onClick={() => setGalleryOpen(true)}>
            Tambah gambar
          </button>
        </div>
        <input type="hidden" name="imageIds" value={images.map((m) => m.id).join(",")} />
        <input type="hidden" name="primaryImageId" value={primaryId} />
        {images.length === 0 ? (
          <p className="mt-3 font-body text-sm text-ink-400">Belum ada gambar. Gambar pertama otomatis jadi utama.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((m) => (
              <li key={m.id} className={`flex flex-col overflow-hidden rounded-sm border ${primaryId === m.id || (primaryId === "" && images[0]?.id === m.id) ? "border-brand-500" : "border-line"}`}>
                <span className="flex aspect-square items-center justify-center bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.path ? <img src={m.path} alt={m.fileName} className="h-full w-full object-cover" /> : <span className="font-body text-xs text-ink-400">{m.fileName}</span>}
                </span>
                <span className="truncate px-2 py-1 font-body text-xs text-ink-600">{m.fileName}</span>
                <span className="flex gap-1 px-2 pb-2">
                  <button type="button" className="font-body text-xs text-brand-500 hover:underline" onClick={() => setPrimaryId(m.id)}>
                    {primaryId === m.id || (primaryId === "" && images[0]?.id === m.id) ? "★ Utama" : "Jadikan utama"}
                  </button>
                  <button type="button" aria-label={`Hapus gambar ${m.fileName}`} className="font-body text-xs text-danger hover:underline" onClick={() => removeImage(m.id)}>
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel-card p-6">
        <h2 className="font-heading text-base font-semibold text-ink-900">Tag & Brosur</h2>
        <div className="mt-4">
          <FormField htmlFor="tags" label="Tag" hint="Pisahkan dengan koma, mis. hemoglobin, rapid test." error={state.fieldErrors?.tags}>
            <TextInput id="tags" name="tags" defaultValue={initial?.tagNames ?? ""} />
          </FormField>
          <FormField htmlFor="brochureMediaId" label="Brosur PDF" hint="Pilih PDF dari pustaka media (opsional).">
            <input type="hidden" id="brochureMediaId" name="brochureMediaId" value={brochure?.id ?? ""} />
            <div className="flex items-center gap-3">
              <span className="font-body text-sm text-ink-600">{brochure ? brochure.fileName : "Belum ada brosur."}</span>
              <button type="button" className="btn-admin-secondary h-8 px-3 text-xs" onClick={() => setBrochureOpen(true)}>
                {brochure ? "Ganti brosur" : "Pilih brosur"}
              </button>
              {brochure && (
                <button type="button" className="font-body text-xs text-danger hover:underline" onClick={() => setBrochure(null)}>
                  Hapus
                </button>
              )}
            </div>
          </FormField>
        </div>
      </div>

      <div className="panel-card p-6">
        <h2 className="font-heading text-base font-semibold text-ink-900">SEO</h2>
        <div className="mt-4">
          <FormField htmlFor="seoTitle" label="Judul SEO" error={state.fieldErrors?.seoTitle}>
            <TextInput id="seoTitle" name="seoTitle" maxLength={190} defaultValue={initial?.seoTitle ?? ""} />
          </FormField>
          <FormField htmlFor="seoDescription" label="Deskripsi SEO" error={state.fieldErrors?.seoDescription}>
            <TextArea id="seoDescription" name="seoDescription" defaultValue={initial?.seoDescription ?? ""} />
          </FormField>
        </div>
      </div>

      {relatedOptions.length > 0 && (
        <div className="panel-card p-6">
          <h2 className="font-heading text-base font-semibold text-ink-900">Produk Terkait</h2>
          <p className="mt-1 font-body text-sm text-ink-400">Kosongkan untuk otomatis dari kategori yang sama.</p>
          <input type="hidden" name="relatedIds" value={relatedIds.join(",")} />
          <ul className="mt-3 flex flex-col gap-2">
            {relatedOptions.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 font-body text-sm text-ink-600">
                  <input type="checkbox" checked={relatedIds.includes(p.id)} onChange={() => toggleRelated(p.id)} />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="btn-admin w-fit" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan produk"}
      </button>

      <MediaPicker open={galleryOpen} onClose={() => setGalleryOpen(false)} onSelect={onSelectGallery} />
      <MediaPicker open={brochureOpen} onClose={() => setBrochureOpen(false)} onSelect={(m) => setBrochure(m)} />
    </form>
  );
}
