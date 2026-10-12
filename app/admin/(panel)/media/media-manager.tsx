"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import {
  deleteMediaAction,
  renameMediaAction,
  uploadMediaAction,
} from "@/app/admin/(panel)/media/actions";

export type MediaRow = {
  id: string;
  path: string;
  fileName: string;
  altText: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Manajer media: unggah, grid, ganti nama, hapus, salin URL.
 * Validasi tipe/ukuran sebenarnya dilakukan di server action.
 */
export function MediaManager({ items }: { items: MediaRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [renameTarget, setRenameTarget] = useState<MediaRow | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadMediaAction(fd);
    setUploading(false);
    if (result.ok) {
      toast("Berkas berhasil diunggah.", "success");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const onConfirmRename = () => {
    if (!renameTarget) return;
    startTransition(async () => {
      const result = await renameMediaAction(renameTarget.id, renameValue);
      if (result.ok) {
        toast("Nama berkas diperbarui.", "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
      setRenameTarget(null);
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteMediaAction(deleteTarget.id);
      if (result.ok) {
        toast("Media dihapus.", "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
      setDeleteTarget(null);
    });
  };

  const copyUrl = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      toast("URL disalin ke clipboard.", "success");
    } catch {
      toast("Gagal menyalin URL.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Zona unggah */}
      <div className="panel-card p-4">
        <label className="field-label" htmlFor="file-upload">
          Unggah media
        </label>
        <input
          id="file-upload"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
          className="block w-full font-body text-sm text-ink-600 file:mr-3 file:rounded-sm file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:font-heading file:text-sm file:font-semibold file:text-white"
        />
        <p className="mt-2 font-body text-xs text-ink-400">
          Format: JPG, PNG, WEBP, GIF, SVG, PDF. Maksimum 5 MB per berkas.
          {uploading && " Mengunggah…"}
        </p>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="panel-card p-16 text-center font-body text-sm text-ink-400">
          Belum ada media. Unggah berkas pertama Anda.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <div key={m.id} className="panel-card overflow-hidden">
              <div className="flex aspect-square items-center justify-center bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.path}
                  alt={m.altText ?? m.fileName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="truncate font-body text-sm text-ink-900">
                  {m.fileName}
                </p>
                <p className="font-body text-xs text-ink-400">
                  {formatSize(m.size)}
                  {m.width && m.height ? ` · ${m.width}×${m.height}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="font-body text-xs font-semibold text-brand-500"
                    onClick={() => copyUrl(m.path)}
                  >
                    Salin URL
                  </button>
                  <button
                    type="button"
                    className="font-body text-xs font-semibold text-ink-600"
                    onClick={() => {
                      setRenameTarget(m);
                      setRenameValue(m.fileName);
                    }}
                  >
                    Ganti nama
                  </button>
                  <button
                    type="button"
                    className="font-body text-xs font-semibold text-danger"
                    onClick={() => setDeleteTarget(m)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog ganti nama */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="panel-card w-full max-w-sm p-6">
            <h2 className="font-heading text-base font-semibold text-ink-900">
              Ganti nama berkas
            </h2>
            <input
              className="input-admin mt-3"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              aria-label="Nama berkas baru"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setRenameTarget(null)}
                disabled={pending}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-admin"
                onClick={onConfirmRename}
                disabled={pending}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus media?"
        description={`Berkas "${deleteTarget?.fileName}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        danger
        busy={pending}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
