import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;

