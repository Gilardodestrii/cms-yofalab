"use client";

import { useEffect, useState } from "react";

export type MediaItem = {
  id: string;
  path: string;
  fileName: string;
  altText: string | null;
  mimeType: string;
};

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
};

/**
 * Dialog pemilih media yang dapat dipakai ulang modul lain (produk, blog).
 * Memuat daftar media dari `/api/media`, mendukung pencarian dan pemilihan.
 */
export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/media?perPage=50")
      .then((r) => r.json())
      .then((data: { items: MediaItem[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = items.filter((m) =>
    m.fileName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pilih media"
        className="panel-card flex max-h-[80vh] w-full max-w-2xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line p-4">
          <h2 className="font-heading text-base font-semibold text-ink-900">
            Pilih Media
          </h2>
          <input
            type="search"
            placeholder="Cari nama berkas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-admin mt-3"
            aria-label="Cari media"
          />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4">
          {loading ? (
            <p className="col-span-full py-8 text-center font-body text-sm text-ink-400">
              Memuat…
            </p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full py-8 text-center font-body text-sm text-ink-400">
              Tidak ada media.
            </p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelect(m);
                  onClose();
                }}
                className="group flex flex-col overflow-hidden rounded-sm border border-line text-left hover:border-brand-600"
              >
                <span className="flex aspect-square items-center justify-center bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.path}
                    alt={m.altText ?? m.fileName}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="truncate px-2 py-1 font-body text-xs text-ink-600">
                  {m.fileName}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="flex justify-end border-t border-line p-4">
          <button type="button" className="btn-admin-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}