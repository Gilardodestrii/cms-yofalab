import type { Config } from "tailwindcss";

/**
 * Token Tailwind YOFALAB.
 * Diturunkan 1:1 dari `docs/Design System YOFALAB Publik dan Admin.md`.
 * Jangan pakai hex langsung di komponen; selalu lewat nama token di sini.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F8F0FB",
          300: "#E7A6C9",
          500: "#B5628F",
          600: "#9B4478",
          700: "#7A2F6B",
          800: "#683352",
          link: "#FFD6EC",
        },
        ink: { 900: "#2B2B2B", 600: "#5A5A5A", 400: "#6E6E6E" },
        line: "#E6E6E6",
        surface: { DEFAULT: "#FFFFFF", muted: "#F2F2F2", admin: "#F7F5F8" },
        coral: "#F27A7A",
        success: "#2E9E6B",
        warning: "#E0A100",
        danger: "#D64545",
        info: "#3B82C4",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      borderRadius: { sm: "4px", md: "8px", lg: "16px" },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.10)",
        panel: "0 1px 3px rgba(0,0,0,0.08)",
      },
      maxWidth: {
        container: "1230px",
        reading: "720px",
      },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    },
  },
  plugins: [],
};

export default config;
