import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — alat kesehatan & reagen laboratorium`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Gambar sosial default (Open Graph + Twitter Card) untuk halaman tanpa
 * gambar khusus. Dibuat saat build memakai font bawaan `next/og`.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #7A2F6B 0%, #B5628F 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, opacity: 0.85 }}>
          ALAT KESEHATAN & REAGEN LABORATORIUM
        </div>
        <div style={{ fontSize: 86, fontWeight: 700, marginTop: 24 }}>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 34, marginTop: 24, opacity: 0.9 }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    size,
  );
}
