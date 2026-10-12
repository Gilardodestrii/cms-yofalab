# Design System YOFALAB: Publik dan Admin

Oct 12, 2026 · @Venom

## 1. Prinsip Desain

Design System ini diturunkan dari tampilan situs YOFALAB yang ada (Home, Product, Detail Produk, Blog, About, Contact) dan diperluas untuk panel admin. Nilai warna dan ukuran adalah **perkiraan dari screenshot**; cocokkan dengan file desain asli bila ada.

- **Bersih dan klinis:** latar putih dan abu sangat muda, ruang kosong lega, kesan terpercaya khas produk kesehatan.
- **Satu warna merek:** ungu-magenta untuk aksi dan penekanan; pink muda untuk tautan di latar gelap dan aksen lembut.
- **Konsisten:** komponen publik dan admin memakai token yang sama, hanya kepadatan admin lebih rapat.
- **Mudah dipindai:** judul tebal Poppins, isi Nunito, label kategori huruf kapital kecil.

## 2. Token Warna

Nilai hex diperkirakan dari screenshot situs; semua dipakai lewat nama token, tidak pernah hex langsung di komponen.

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `brand-700` | #7A2F6B | Tombol hero "Contact Us", teks aksen gelap |
| `brand-600` | #9B4478 | Latar footer, judul "YOFALAB" di hero, tab dan menu aktif |
| `brand-500` | #B5628F | Tombol utama (Read More, Send Message, Post Comment), garis bawah menu aktif |
| `brand-300` | #E7A6C9 | Bilah pencarian blog, aksen kartu |
| `brand-link` | #FFD6EC | Tautan di atas latar `brand-600` (telepon, WhatsApp, email footer) |
| `brand-50` | #F8F0FB | Latar section (blog terbaru, Vision dan Mission) |
| `ink-900` | #2B2B2B | Judul dan teks utama |
| `ink-600` | #5A5A5A | Teks isi, deskripsi |
| `ink-400` | #8A8A8A | Placeholder, label sekunder |
| `line` | #E6E6E6 | Garis pemisah, border input |
| `surface` | #FFFFFF | Latar halaman, kartu |
| `surface-muted` | #F2F2F2 | Latar gambar produk, header detail blog |
| `accent-coral` | #F27A7A | Latar banner kategori (Hemoglobin Meter) |
| `success` | #2E9E6B | Status Published, Disetujui, Berhasil |
| `warning` | #E0A100 | Status Draft, Menunggu moderasi |
| `danger` | #D64545 | Hapus, error validasi, Spam |
| `info` | #3B82C4 | Status Baru, informasi |

**Kontras (dihitung):** putih di atas `brand-600` dan `brand-700` lulus WCAG AA (sekitar 6:1). Putih di atas `brand-500` sekitar 4,1:1, jadi untuk teks kecil pakai latar `brand-600`. Pink tautan di screenshot lebih gelap dan kontrasnya rendah di atas `brand-600`, maka `brand-link` diperterang ke #FFD6EC (sekitar 4,6:1).

## 3. Tipografi

Judul memakai **Poppins** (tebal, rapat), isi memakai **Nunito**. Keduanya dari Google Fonts lewat `next/font`. Admin memakai pasangan yang sama.

| Token | Font | Ukuran / tinggi baris | Berat | Pemakaian |
| --- | --- | --- | --- | --- |
| `display` | Poppins | 56 / 64 px (mobile 36 / 44) | 700 | Judul halaman ("Product", "Contact Us", "Blog") |
| `h1` | Poppins | 40 / 48 px (mobile 30 / 38) | 700 | Judul detail blog, judul produk |
| `h2` | Poppins | 28 / 36 px | 600 | Judul section ("Latest Blogs", "Related products") |
| `h3` | Poppins | 20 / 28 px | 600 | Nama produk pada kartu, judul artikel di grid |
| `h4` | Poppins | 16 / 24 px | 600 | Judul kecil, judul kolom footer |
| `body-lg` | Nunito | 18 / 30 px | 400 | Paragraf pembuka, deskripsi produk |
| `body` | Nunito | 16 / 26 px | 400 | Isi artikel, paragraf |
| `body-sm` | Nunito | 14 / 22 px | 400 | Kutipan artikel, teks footer, bantuan formulir |
| `label` | Nunito | 12 / 16 px, huruf kapital, jarak huruf 0,04em | 600 | Kategori produk, kategori blog, penulis dan tanggal |
| `button` | Poppins | 14 / 20 px | 600 | Semua tombol |

Admin: tabel dan formulir memakai `body-sm`; judul halaman admin memakai `h1` berukuran 28 px.

## 4. Spasi, Bentuk, dan Grid

| Kelompok | Token dan nilai |
| --- | --- |
| Spasi (kelipatan 4 px) | `1`=4, `2`=8, `3`=12, `4`=16, `6`=24, `8`=32, `12`=48, `16`=64, `24`=96 px |
| Jarak antar section publik | 64 px (mobile), 96 px (desktop) |
| Radius | `sm` 4 px (input, tombol), `md` 8 px (kartu, panel), `lg` 16 px (gambar About Us, banner kategori), `full` (avatar, ikon bulat) |
| Bayangan | `card`: 0 4px 16px rgba(0,0,0,0.06); `card-hover`: 0 8px 24px rgba(0,0,0,0.10); `panel` (admin): 0 1px 3px rgba(0,0,0,0.08) |
| Border | 1 px `line`; fokus: cincin 2 px `brand-500` jarak 2 px |
| Lebar kontainer | Maks. 1230 px, gutter 24 px (desktop) dan 16 px (mobile) |
| Lebar baca artikel | Maks. 720 px, rata tengah |
| Breakpoint | `sm` 640, `md` 768, `lg` 1024, `xl` 1280 px |
| Grid produk | 4 kolom (≥1024), 3 (≥768), 2 (≥640), 1 (di bawahnya), celah 30 px |
| Grid blog | 3 kolom (≥1024), 2 (≥768), 1 (di bawahnya), celah 32 px |
| Gerak | Transisi 150 ms ease-out untuk hover dan fokus; hormati `prefers-reduced-motion` |

## 5. Komponen Situs Publik

| Komponen | Spesifikasi | Keadaan |
| --- | --- | --- |
| Header | Tinggi 110 px, latar putih, garis bawah 1 px `line`; logo kiri; menu kanan (Home, Product, Blog, About Us, Contact us) `body` 15 px, tebal 500 | Menu aktif: teks `brand-500` + garis bawah 2 px; hover: teks `brand-500`; mobile: ikon burger dan panel geser |
| Tombol utama | Latar `brand-500`, teks putih `button`, tinggi 40 px, padding 8 × 20, radius `sm` | Hover: `brand-600`; fokus: cincin; nonaktif: opasitas 50% |
| Tombol hero | Latar `brand-700`, teks putih, radius `md` | Hover: lebih gelap 8% |
| Tombol garis (Download Brosur) | Border 2 px `brand-700`, teks `brand-700`, latar putih, tinggi 48 px, radius `sm` | Hover: latar `brand-50` |
| Breadcrumb | `label` 12 px huruf kapital; tautan `brand-500`, halaman aktif `ink-900`, pemisah "/" | Rata tengah di halaman daftar, rata kiri di detail |
| Kartu produk | Gambar persegi latar `surface-muted`, nama `h3` rata tengah, kategori `label`, garis pemisah, tombol teks "Read more"; radius `md`, bayangan `card` | Hover: `card-hover`, gambar zoom 1,03 |
| Kartu artikel | Tanpa gambar di grid; kategori `label`, judul `h3`, kutipan `body-sm` 3 baris, tombol "Read More", baris meta (penulis / tanggal, huruf kapital) | Hover: judul `brand-500` |
| Kartu statistik (Home) | Putih, radius `md`, bayangan `card`, ikon `brand-600`, angka `display` 48 px, label `brand-600` | Tiga kolom setara |
| Blok keunggulan | Ikon garis 64 px `brand-600`, judul `h2` 24 px `brand-600`, deskripsi `body` | Ikon di kiri, foto di kanan dengan sudut diputar |
| Carousel kategori | Banner 16:6, latar `accent-coral`, panah bulat putih, titik indikator | Otomatis geser 5 detik, berhenti saat hover |
| Bilah pencarian blog | Tinggi 44 px, latar `brand-300`, ikon cari di kanan, radius `full` | Fokus: cincin `brand-600` |
| Tab Description | Judul tab `label` 14 px `brand-600` dengan garis bawah 3 px | Satu tab pada v1; siap ditambah |
| Daftar spesifikasi | Poin bulat, label tebal diikuti nilai | Dipakai pada Specifications dan Applications |
| Formulir | Input gaya garis bawah (tanpa kotak), label mengambang, tanda bintang wajib; area pesan 4 baris; tombol Send Message `brand-500` | Error: garis dan pesan `danger`; sukses: banner `success` |
| Footer | Latar `brand-600`, teks putih; 3 kolom (alamat, Pages, Contact Us); tautan `brand-link`; baris bawah: ikon sosial dan hak cipta; tombol kembali ke atas persegi `brand-300` | Mobile: kolom bertumpuk |

## 6. Komponen Panel Admin

Admin memakai token yang sama, dengan kepadatan lebih rapat dan latar `#F7F5F8` (ungu keabuan sangat muda) agar panel putih menonjol.

| Komponen | Spesifikasi |
| --- | --- |
| Layout | Sidebar kiri 248 px latar `brand-700`, teks putih; topbar 64 px putih dengan pencarian cepat, nama pengguna, menu profil; area konten maks. 1280 px, padding 24 px |
| Sidebar | Grup menu: Konten (Produk, Kategori, Blog, Komentar, Halaman, Media), Komunikasi (Pesan Kontak), Sistem (Pengaturan, Pengguna, Log). Item aktif: latar putih 12% dan garis kiri 3 px `brand-300`. Mobile: sidebar jadi laci |
| Kartu ringkasan | Putih, radius `md`, bayangan `panel`; angka 28 px Poppins 600, label `body-sm` `ink-600`, ikon di `brand-50` |
| Tabel data | Header `label` di latar `brand-50`; baris 48 px; hover `#FAF6FB`; kolom aksi di kanan (Ubah, Hapus) berupa ikon; pencarian, filter, urutan, dan paginasi 10, 25, 50 per halaman; keadaan kosong dengan ilustrasi dan tombol tambah |
| Badge status | Bentuk pil, teks 12 px 600: Published `success`, Draft `warning`, Arsip `ink-400`, Baru `info`, Dibaca `ink-400`, Ditindaklanjuti `success`, Menunggu `warning`, Spam `danger`. Latar = warna yang sama pada opasitas 12% |
| Formulir | Input berkotak (tinggi 40 px, border `line`, radius `sm`), label di atas, teks bantuan di bawah, error `danger`; dua kolom pada layar lebar: konten utama kiri, panel samping kanan (status, kategori, gambar utama, SEO) |
| Editor rich text | Toolbar: heading, tebal, miring, daftar, tautan, gambar dari Media, kutipan, tanda hubung; area edit memakai tipografi artikel publik agar tampilan sama |
| Editor daftar poin | Untuk Specifications dan Applications: baris label + nilai, tombol tambah, seret untuk mengurutkan, hapus per baris |
| Media picker | Dialog dengan grid thumbnail 4 kolom, unggah seret dan lepas, pencarian nama, pratinjau, kolom teks alternatif wajib untuk gambar |
| Dialog konfirmasi | Judul, penjelasan dampak, tombol Batal (garis) dan Hapus (`danger`) |
| Toast | Kanan atas, 4 detik; sukses, error, info; bisa ditutup |
| Bilah aksi lengket | Di bawah formulir panjang: Simpan Draft, Terbitkan, Pratinjau; muncul peringatan bila ada perubahan belum tersimpan |
| Halaman login | Panel putih tengah, logo, email, kata sandi, tombol utama penuh lebar, pesan error umum (tidak membedakan email atau kata sandi salah) |

## 7. Pola Halaman dan Aksesibilitas

**Pola halaman publik**

- **Halaman daftar** (Product, Blog): breadcrumb rata tengah → judul `display` rata tengah → grid → paginasi atau tombol Next.
- **Halaman detail produk:** breadcrumb kiri → dua kolom (gambar 5/12, informasi 7/12) → tab Description → Download Brosur di tengah → Related products (5 kartu).
- **Halaman detail blog:** pita abu dengan breadcrumb, judul, meta → gambar utama → isi (lebar baca 720 px) → blok media sosial → formulir komentar.
- **Home:** hero penuh lebar dengan kartu statistik menumpang di tepi bawah → profil singkat → keunggulan → kategori → blog terbaru.

**Pola halaman admin**

- **Daftar:** judul + tombol "Tambah" → bilah filter → tabel → paginasi.
- **Form:** breadcrumb → judul → dua kolom (konten dan panel samping) → bilah aksi lengket.

**Aksesibilitas**

- Teks isi memenuhi kontras 4,5:1; teks besar 3:1. `brand-300` di atas putih hanya sekitar 2:1, jadi tautan breadcrumb memakai `brand-500` dan `brand-300` hanya untuk dekorasi.
- Semua kontrol dapat dioperasikan dengan keyboard; cincin fokus selalu terlihat.
- Gambar produk dan artikel wajib punya teks alternatif; admin menolak simpan bila kosong.
- Target sentuh minimal 44 × 44 px di mobile.
- Status tidak hanya dibedakan warna: badge selalu memuat teks.

## 8. Token untuk Tailwind

Salin ke `tailwind.config.ts` (atau `@theme` pada Tailwind 4). Komponen hanya memakai nama token.

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F8F0FB", 300: "#E7A6C9", 500: "#B5628F",
          600: "#9B4478", 700: "#7A2F6B", link: "#FFD6EC",
        },
        ink: { 900: "#2B2B2B", 600: "#5A5A5A", 400: "#8A8A8A" },
        line: "#E6E6E6",
        surface: { DEFAULT: "#FFFFFF", muted: "#F2F2F2", admin: "#F7F5F8" },
        coral: "#F27A7A",
        success: "#2E9E6B", warning: "#E0A100",
        danger: "#D64545", info: "#3B82C4",
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
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    },
  },
} satisfies Config;
```
