"use client";

import { useActionState, useState } from "react";
import { FormField, TextArea, TextInput } from "@/components/admin/form-field";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";
import { saveAboutPageAction, saveHomePageAction, type PageActionState } from "./actions";

const initialState: PageActionState = {};

/** Pemberitahuan hasil simpan (sukses/error) untuk editor halaman. */
function Notice({ state }: { state: PageActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="mb-4 rounded-sm bg-danger/10 px-3 py-2 font-body text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="mb-4 rounded-sm bg-success/10 px-3 py-2 font-body text-sm text-success">
        Halaman tersimpan dan situs publik diperbarui.
      </p>
    );
  }
  return null;
}

/** Format daftar "nilai|label" (satu per baris) untuk textarea. */
function toLines(pairs: { value: string; label: string }[]): string {
  return pairs.map((p) => `${p.value}|${p.label}`).join("\n");
}

/** Format daftar keunggulan "judul|isi" (satu per baris). */
function toAdvantageLines(pairs: { title: string; body: string }[]): string {
  return pairs.map((p) => `${p.title}|${p.body}`).join("\n");
}

/**
 * Field gambar tunggal opsional: preview + pilih dari pustaka media.
 * Diekspor agar dipakai ulang formulir pengaturan (logo situs).
 * Nilai dikirim sebagai hidden input JSON — format sama dengan MediaPicker,
 * sehingga action cukup membacanya lewat `parseImagePath`.
 */
export function SingleImageField({
  name,
  label,
  hint,
  initialPath,
}: {
  name: string;
  label: string;
  hint: string;
  initialPath: string;
}) {
  const [image, setImage] = useState<MediaItem | null>(
    initialPath
      ? {
          id: "existing",
          path: initialPath,
          fileName: initialPath.split("/").pop() ?? "gambar",
          altText: null,
          mimeType: "",
        }
      : null,
  );
  const [open, setOpen] = useState(false);

  return (
    <FormField htmlFor={name} label={label} hint={hint}>
      <input type="hidden" id={name} name={name} value={image ? JSON.stringify(image) : ""} />
      <div className="flex flex-wrap items-center gap-3">
        {image ? (
          <span className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.path}
              alt={image.altText ?? image.fileName}
              className="h-20 w-28 rounded-sm border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-danger font-body text-xs text-white"
              aria-label={`Hapus gambar ${image.fileName}`}
            >
              ×
            </button>
          </span>
        ) : (
          <span className="font-body text-sm text-ink-400">Belum ada gambar.</span>
        )}
        <button
          type="button"
          className="btn-admin-secondary h-8 px-3 text-xs"
          onClick={() => setOpen(true)}
        >
          {image ? "Ganti gambar" : "Pilih gambar"}
        </button>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={setImage} />
    </FormField>
  );
}

/** Editor blok Home (`pages.HOME`). */
export function HomePageForm({ initial }: { initial: {
  heroTitle: string;
  heroSubtitle: string;
  stats: { value: string; label: string }[];
  getToKnowTitle: string;
  getToKnowBody: string;
  getToKnowImagePath: string;
  advantages: { title: string; body: string }[];
  advantagesImagePath: string;
} }) {
  const [state, formAction, pending] = useActionState(saveHomePageAction, initialState);

  // Slide tetap dikelola sebagai daftar gambar; editor ringkas: satu gambar per baris.
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <form action={formAction} noValidate className="panel-card p-6">
      <h2 className="font-heading text-base font-semibold text-ink-900">Halaman Home</h2>
      <p className="mt-1 mb-4 font-body text-sm text-ink-600">
        Blok hero, statistik, Get to Know, dan keunggulan. Satu baris per entri dengan pemisah <code>|</code>.
      </p>
      <Notice state={state} />

      <FormField htmlFor="heroTitle" label="Judul hero">
        <TextInput id="heroTitle" name="heroTitle" maxLength={190} defaultValue={initial.heroTitle} />
      </FormField>
      <FormField htmlFor="heroSubtitle" label="Subjudul hero">
        <TextArea id="heroSubtitle" name="heroSubtitle" rows={3} maxLength={500} defaultValue={initial.heroSubtitle} />
      </FormField>

      <FormField htmlFor="stats" label="Statistik" hint="Format: nilai|label — mis. 20+|Products">
        <TextArea id="stats" name="stats" rows={4} defaultValue={toLines(initial.stats)} />
      </FormField>

      <FormField htmlFor="getToKnowTitle" label="Judul blok Get to Know">
        <TextInput id="getToKnowTitle" name="getToKnowTitle" maxLength={190} defaultValue={initial.getToKnowTitle} />
      </FormField>
      <FormField htmlFor="getToKnowBody" label="Isi blok Get to Know">
        <TextArea id="getToKnowBody" name="getToKnowBody" rows={4} maxLength={2000} defaultValue={initial.getToKnowBody} />
      </FormField>

      <SingleImageField
        name="getToKnowImage"
        label="Gambar blok Get to Know"
        hint="Opsional; tampil di sebelah kiri teks. Pilih dari pustaka media."
        initialPath={initial.getToKnowImagePath}
      />

      <FormField htmlFor="advantages" label="Tiga keunggulan" hint="Format: judul|isi — satu per baris (maks 6).">
        <TextArea id="advantages" name="advantages" rows={6} defaultValue={toAdvantageLines(initial.advantages)} />
      </FormField>

      <SingleImageField
        name="advantagesImage"
        label="Gambar blok keunggulan"
        hint="Opsional; tampil di sebelah kanan daftar keunggulan."
        initialPath={initial.advantagesImagePath}
      />

      <FormField htmlFor="slides" label="Gambar hero tambahan" hint="Opsional; pilih gambar dari pustaka media.">
        <input type="hidden" id="slides" name="slides" value={JSON.stringify(slides)} />
        <div className="flex flex-wrap items-center gap-3">
          {slides.map((s) => (
            <span key={s.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.path} alt={s.altText ?? s.fileName} className="h-16 w-24 rounded-sm border border-line object-cover" />
              <button
                type="button"
                onClick={() => setSlides((prev) => prev.filter((x) => x.id !== s.id))}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-danger font-body text-xs text-white"
                aria-label={`Hapus gambar ${s.fileName}`}
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" className="btn-admin-secondary h-8 px-3 text-xs" onClick={() => setPickerOpen(true)}>
            Tambah gambar
          </button>
        </div>
      </FormField>

      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan halaman Home"}
      </button>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => setSlides((prev) => [...prev, m])}
      />
    </form>
  );
}

/** Editor About Us (`pages.ABOUT`). */
export function AboutPageForm({ initial }: { initial: {
  profile: string;
  profileImagePath: string;
  vision: string;
  mission: string[];
  rnd: string;
} }) {
  const [state, formAction, pending] = useActionState(saveAboutPageAction, initialState);

  return (
    <form action={formAction} noValidate className="panel-card p-6">
      <h2 className="font-heading text-base font-semibold text-ink-900">Halaman About Us</h2>
      <p className="mt-1 mb-4 font-body text-sm text-ink-600">
        Foto, profil, Vision, Mission, dan R&D tampil di halaman <code>/about</code>.
      </p>
      <Notice state={state} />

      <SingleImageField
        name="profileImage"
        label="Foto perusahaan"
        hint="Tampil di atas judul Tentang YOFALAB. Pilih dari pustaka media."
        initialPath={initial.profileImagePath}
      />
      <FormField htmlFor="profile" label="Profil perusahaan">
        <TextArea id="profile" name="profile" rows={6} maxLength={4000} defaultValue={initial.profile} />
      </FormField>
      <FormField htmlFor="vision" label="Vision">
        <TextArea id="vision" name="vision" rows={3} maxLength={2000} defaultValue={initial.vision} />
      </FormField>
      <FormField htmlFor="mission" label="Mission" hint="Satu poin per baris.">
        <TextArea id="mission" name="mission" rows={5} defaultValue={initial.mission.join("\n")} />
      </FormField>
      <FormField htmlFor="rnd" label="Research & Development">
        <TextArea id="rnd" name="rnd" rows={5} maxLength={4000} defaultValue={initial.rnd} />
      </FormField>

      <button type="submit" className="btn-admin" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan halaman About"}
      </button>
    </form>
  );
}
