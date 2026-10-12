import type { NextConfig } from "next";

/**
 * Header keamanan dasar (Sprint 8).
 *
 * CSP memakai 'unsafe-inline' untuk script/style karena Next.js menyisipkan
 * skrip bootstrap inline; CSP ketat berbasis nonce perlu middleware dinamis.
 * ponytail: longgarkan CSP dulu; naikkan ke nonce via middleware bila perlu.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Gambar disajikan dari route handler lokal `/uploads/...`, sehingga tidak
  // perlu remotePatterns. Bila kelak pindah ke object storage, tambahkan host
  // di sini.
  images: {
    remotePatterns: [],
  },
  // Naikkan batas body server action untuk unggahan media (maks 5 MB + margin).
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Berkas unggahan memakai CSP ketat tersendiri.
        //
        // CSP global di atas longgar (`script-src 'unsafe-inline'`) demi skrip
        // bootstrap Next.js — dan tanpa aturan ini CSP global itulah yang
        // berlaku pada `/uploads/*`, sehingga SVG berisi skrip yang diunggah
        // admin bisa dijalankan di origin situs. Hanya SATU header
        // Content-Security-Policy yang dihormati browser, jadi CSP khusus ini
        // harus ditulis di sini — bukan di route handler.
        source: "/uploads/:path*",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "Content-Security-Policy"),
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'none'",
              "style-src 'unsafe-inline'",
              "img-src data:",
              "sandbox",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
