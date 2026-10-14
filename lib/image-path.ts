/**
 * Path gambar dari hidden input JSON (dikirim komponen MediaPicker).
 * Hanya menerima path `/uploads/...` — tidak pernah memercayai path
 * mentah dari klien ke DB.
 */
export function parseImagePath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const raw = JSON.parse(value) as { path?: string };
    const path = raw?.path;
    return typeof path === "string" && path.startsWith("/uploads/") ? path : "";
  } catch {
    return "";
  }
}
