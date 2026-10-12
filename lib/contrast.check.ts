/**
 * Self-check kontras WCAG 2 AA untuk palet Tailwind (`tailwind.config.ts`).
 * Jalankan: npx tsx lib/contrast.check.ts
 *
 * Ambang WCAG 2 AA: 4.5:1 teks normal, 3:1 teks besar (>= 24 px atau >= 18,66 px bold)
 * dan komponen UI/grafik.
 */

const PALETTE: Record<string, string> = {
  "brand-500": "#B5628F",
  "brand-600": "#9B4478",
  "brand-700": "#7A2F6B",
  "brand-link": "#FFD6EC",
  "ink-900": "#2B2B2B",
  "ink-600": "#5A5A5A",
  "ink-400": "#6E6E6E",
  white: "#FFFFFF",
  "surface-muted": "#F2F2F2",
  "surface-admin": "#F7F5F8",
  "brand-50": "#F8F0FB",
};

function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/** Kombinasi yang benar-benar dipakai di UI (teks normal di atas latar). */
const CASES: { fg: string; bg: string; min: number; label: string }[] = [
  { fg: "ink-900", bg: "white", min: 4.5, label: "teks utama" },
  { fg: "ink-600", bg: "white", min: 4.5, label: "teks sekunder" },
  { fg: "ink-400", bg: "white", min: 4.5, label: "teks redup / placeholder" },
  { fg: "brand-600", bg: "white", min: 4.5, label: "tautan & label brand" },
  { fg: "brand-700", bg: "white", min: 4.5, label: "judul brand" },
  { fg: "white", bg: "brand-600", min: 4.5, label: "teks tombol primer" },
  { fg: "white", bg: "brand-700", min: 4.5, label: "tombol hero / sidebar" },
  { fg: "brand-link", bg: "brand-700", min: 4.5, label: "tautan footer" },
  { fg: "ink-900", bg: "surface-muted", min: 4.5, label: "teks di panel" },
  { fg: "ink-900", bg: "surface-admin", min: 4.5, label: "teks di admin" },
  { fg: "brand-700", bg: "brand-50", min: 4.5, label: "tombol outline" },
  { fg: "brand-600", bg: "white", min: 3, label: "border/fokus komponen" },
];

let failed = 0;
for (const c of CASES) {
  const ratio = contrast(PALETTE[c.fg], PALETTE[c.bg]);
  const ok = ratio >= c.min;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "OK  " : "FAIL"} ${c.label.padEnd(28)} ${c.fg} di ${c.bg} = ${ratio.toFixed(2)}:1 (min ${c.min})`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} kombinasi gagal WCAG 2 AA.`);
  process.exit(1);
}
console.log("\nSemua kombinasi lolos WCAG 2 AA.");
