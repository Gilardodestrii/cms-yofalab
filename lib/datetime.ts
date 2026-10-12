/** Helper tanggal bersama server + klien (bukan modul klien). */

/** Format `Date` menjadi nilai `datetime-local` (YYYY-MM-DDTHH:mm) waktu lokal. */
export function toDatetimeLocal(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
