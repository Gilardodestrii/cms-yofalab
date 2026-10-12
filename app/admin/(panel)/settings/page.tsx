import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import {
  DEFAULT_CONTACT,
  DEFAULT_FOOTER,
  DEFAULT_SITE,
  getContactSetting,
  getFooterSetting,
  getSiteSetting,
} from "@/lib/settings";
import { uploadSettingSchema } from "@/lib/validators/settings";
import { FormField, SettingsSection, TextArea, TextInput } from "./settings-section";
import {
  saveContactSettingAction,
  saveFooterSettingAction,
  saveSiteSettingAction,
  saveUploadSettingAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Pengaturan Situs",
  robots: { index: false, follow: false },
};

/** Halaman Pengaturan (`/admin/settings`). Hanya SUPER_ADMIN. */
export default async function AdminSettingsPage() {
  await requireRole(["SUPER_ADMIN"], "/admin/settings");

  const [contact, footer, site, uploadRow] = await Promise.all([
    getContactSetting(),
    getFooterSetting(),
    getSiteSetting(),
    db.siteSetting
      .findUnique({ where: { key: "upload" }, select: { value: true } })
      .catch(() => null),
  ]);
  const upload = uploadSettingSchema.safeParse(uploadRow?.value);
  const maxUploadMb = upload.success ? upload.data.maxUploadMb : 5;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Pengaturan" }]} />
      <div>
        <h1 className="font-heading text-lg font-semibold text-ink-900">Pengaturan Situs</h1>
        <p className="mt-1 font-body text-sm text-ink-600">
          Perubahan langsung berlaku di situs publik setelah disimpan.
        </p>
      </div>

      <SettingsSection
        title="Identitas & SEO Default"
        description="Dipakai sebagai nama situs dan meta default bila halaman tidak mengisi SEO sendiri."
        action={saveSiteSettingAction}
      >
        <FormField htmlFor="name" label="Nama situs" required>
          <TextInput id="name" name="name" required maxLength={120} defaultValue={site.name} />
        </FormField>
        <FormField htmlFor="tagline" label="Tagline">
          <TextInput id="tagline" name="tagline" maxLength={190} defaultValue={site.tagline} />
        </FormField>
        <FormField htmlFor="seoTitle" label="SEO title default">
          <TextInput id="seoTitle" name="seoTitle" maxLength={190} defaultValue={site.seoTitle} />
        </FormField>
        <FormField htmlFor="seoDescription" label="SEO description default">
          <TextArea id="seoDescription" name="seoDescription" rows={2} maxLength={320} defaultValue={site.seoDescription} />
        </FormField>
        <FormField
          htmlFor="notifyEmail"
          label="Email penerima notifikasi kontak"
          hint="Kosongkan untuk memakai nilai MAIL_TO dari .env."
        >
          <TextInput id="notifyEmail" name="notifyEmail" type="email" maxLength={190} defaultValue={site.notifyEmail} />
        </FormField>
      </SettingsSection>

      <SettingsSection
        title="Info Kontak"
        description="Dipakai di halaman Contact, footer, dan tombol WhatsApp pada detail produk."
        action={saveContactSettingAction}
      >
        <FormField htmlFor="address" label="Alamat">
          <TextArea id="address" name="address" rows={3} maxLength={500} defaultValue={contact.address} />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField htmlFor="phone" label="Telepon">
            <TextInput id="phone" name="phone" maxLength={60} defaultValue={contact.phone} />
          </FormField>
          <FormField htmlFor="whatsapp" label="WhatsApp">
            <TextInput id="whatsapp" name="whatsapp" maxLength={60} defaultValue={contact.whatsapp} />
          </FormField>
        </div>
        <FormField htmlFor="email" label="Email">
          <TextInput id="email" name="email" type="email" maxLength={190} defaultValue={contact.email} />
        </FormField>
      </SettingsSection>

      <SettingsSection
        title="Footer & Media Sosial"
        description="Tautan sosial kosong tidak ditampilkan di footer."
        action={saveFooterSettingAction}
      >
        <FormField htmlFor="copyright" label="Teks copyright">
          <TextInput id="copyright" name="copyright" maxLength={300} defaultValue={footer.copyright} />
        </FormField>
        <FormField htmlFor="description" label="Deskripsi singkat footer">
          <TextArea id="description" name="description" rows={2} maxLength={500} defaultValue={footer.description} />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField htmlFor="facebook" label="Facebook">
            <TextInput id="facebook" name="facebook" maxLength={300} defaultValue={footer.facebook} placeholder="https://facebook.com/…" />
          </FormField>
          <FormField htmlFor="instagram" label="Instagram">
            <TextInput id="instagram" name="instagram" maxLength={300} defaultValue={footer.instagram} placeholder="https://instagram.com/…" />
          </FormField>
          <FormField htmlFor="linkedin" label="LinkedIn">
            <TextInput id="linkedin" name="linkedin" maxLength={300} defaultValue={footer.linkedin} placeholder="https://linkedin.com/…" />
          </FormField>
          <FormField htmlFor="youtube" label="YouTube">
            <TextInput id="youtube" name="youtube" maxLength={300} defaultValue={footer.youtube} placeholder="https://youtube.com/…" />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Unggahan Media"
        description="Batas ukuran berkas yang boleh diunggah ke pustaka media."
        action={saveUploadSettingAction}
      >
        <FormField htmlFor="maxUploadMb" label="Ukuran maksimum (MB)">
          <TextInput
            id="maxUploadMb"
            name="maxUploadMb"
            type="number"
            min={1}
            max={50}
            defaultValue={maxUploadMb}
          />
        </FormField>
      </SettingsSection>

      {/* Nilai default dipakai bila baris DB belum ada — tampil sebagai acuan. */}
      <details className="panel-card p-4">
        <summary className="cursor-pointer font-heading text-sm font-semibold text-ink-900">
          Nilai default pabrik
        </summary>
        <pre className="mt-3 overflow-x-auto rounded-sm bg-surface-muted p-3 font-mono text-xs text-ink-600">
          {JSON.stringify({ contact: DEFAULT_CONTACT, footer: DEFAULT_FOOTER, site: DEFAULT_SITE }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
