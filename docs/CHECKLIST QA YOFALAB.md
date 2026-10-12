# Checklist QA YOFALAB

Checklist ini dijalankan setelah database terisi (`npm run db:deploy && npm run db:seed`).

Otomatis terlebih dahulu:

```bash
npm run ci                 # lint + typecheck + check + build
./scripts/smoke.sh http://127.0.0.1:3000
```

Bila keduanya lolos, lanjutkan uji manual di bawah.

## A. Uji end-to-end (Super Admin)

| # | Skenario | Hasil diharapkan |
| --- | --- | --- |
| A1 | Login `admin@yofalab.com` | Masuk ke Dashboard |
| A2 | Tambah kategori produk baru | Tampil di `/admin/categories` dan filter `/product` |
| A3 | Tambah produk + 2 gambar + spesifikasi + tag, status PUBLISHED | Tampil di `/product`; detail memuat galeri, spesifikasi, tag |
| A4 | Tandai gambar kedua sebagai utama | Gambar utama berubah di kartu dan detail produk |
| A5 | Isi brosur PDF pada produk | Tombol *Download Brosur* muncul dan mengunduh berkas |
| A6 | Ubah produk ke DRAFT | Produk hilang dari `/product` |
| A7 | Hapus produk yang punya gambar | Produk diarsipkan (`ARCHIVED`), tidak hilang dari daftar admin |
| A8 | Tambah kategori blog + artikel, status PUBLISHED | Artikel tampil di `/blog` |
| A9 | Jadwalkan artikel terbit 1 jam ke depan | Belum tampil di `/blog`; muncul setelah waktunya lewat |
| A10 | Sisipkan `<script>alert(1)</script>` pada isi artikel | Skrip tidak tersimpan/tereksekusi saat artikel dibuka |
| A11 | Kirim komentar dari `/blog/<slug>` | Muncul di `/admin/comments` berstatus *Menunggu* |
| A12 | Setujui komentar | Komentar tampil di halaman artikel |
| A13 | Kirim formulir di `/contact` | Muncul di `/admin/messages`; status *Baru* |
| A14 | Ubah status pesan → *Ditindaklanjuti* + catatan internal | Tersimpan dan tampil di detail pesan |
| A15 | Ekspor CSV pesan dengan filter status | Berkas CSV terunduh; karakter Indonesia benar di Excel |
| A16 | Unggah gambar 4 MB di `/admin/media` | Berhasil, muncul di pustaka |
| A17 | Unggah berkas 8 MB | Ditolak dengan pesan batas ukuran |
| A18 | Ubah alamat/telepon di `/admin/settings` | Berubah di `/contact` dan footer |
| A19 | Ubah hero Home dan blok keunggulan di `/admin/pages` | Berubah di Home |
| A20 | Tambah pengguna Editor baru | Dapat login dengan peran Editor |
| A21 | Reset kata sandi pengguna | Sandi lama tidak berlaku, sandi baru bisa dipakai |
| A22 | Buka `/admin/logs` | Perubahan A2–A21 tercatat |

## B. Uji lintas peran

| # | Skenario | Super Admin | Editor | Staf CS |
| --- | --- | --- | --- | --- |
| B1 | Buka `/admin` | Boleh | Boleh | Boleh |
| B2 | Buka `/admin/products` | Boleh | Boleh | 403 |
| B3 | Buka `/admin/posts` | Boleh | Boleh | 403 |
| B4 | Buka `/admin/media` | Boleh | Boleh | 403 |
| B5 | Buka `/admin/comments` | Boleh | Boleh | 403 |
| B6 | Buka `/admin/messages` | Boleh | Baca | Boleh + ubah status |
| B7 | Buka `/admin/users` | Boleh | 403 | 403 |
| B8 | Buka `/admin/settings` | Boleh | 403 | 403 |
| B9 | Nonaktifkan Super Admin aktif terakhir | Ditolak | — | — |
| B10 | Hapus pengguna yang punya artikel | Ditolak | — | — |

Uji juga tanpa sesi: buka `/admin/products` di jendela privat → dialihkan ke `/admin/login?callbackUrl=...`.

## C. Uji situs publik (tanpa login)

| # | Skenario | Hasil diharapkan |
| --- | --- | --- |
| C1 | Navigasi 7 rute dengan keyboard saja (Tab/Enter) | Semua menu dan tautan dapat dijangkau; indikator fokus terlihat |
| C2 | Tab pertama di halaman | Muncul tautan *Lompat ke konten utama* |
| C3 | Filter kategori + pencarian + paginasi di `/product` | Hasil sesuai filter; nomor halaman berfungsi |
| C4 | Filter kategori + pencarian + paginasi di `/blog` | Hasil sesuai filter |
| C5 | Buka detail produk | Galeri, tab Description, spesifikasi, aplikasi, produk terkait tampil |
| C6 | Tombol WhatsApp di detail produk | Membuka `wa.me` dengan nomor dari pengaturan |
| C7 | Buka detail artikel | Konten, penulis, tanggal, komentar disetujui, artikel terkait tampil |
| C8 | Kirim 6 komentar berturut-turut | Permintaan ke-6 ditolak (rate limit 5/jam) |
| C9 | Isi field honeypot lewat DevTools lalu kirim | Dibalas sukses palsu, tidak tersimpan |
| C10 | Buka `/sitemap.xml` | Memuat rute statis + produk + artikel PUBLISHED |
| C11 | Buka `/robots.txt` | Melarang `/admin` dan `/api`, memuat tautan sitemap |
| C12 | Periksa `<head>` Home | Ada canonical, Open Graph, Twitter Card, JSON-LD Organization/WebSite |
| C13 | Periksa JSON-LD detail produk | `@type: Product` dengan nama, kategori, URL, brand |
| C14 | Periksa JSON-LD detail artikel | `@type: BlogPosting` dengan headline, tanggal, penulis, publisher |
| C15 | Buka konsol browser di semua halaman | Tidak ada error dan tidak ada peringatan mixed-content |

## D. Uji non-fungsional

| # | Skenario | Target |
| --- | --- | --- |
| D1 | Lighthouse mobile Home | Performance ≥ 90, SEO ≥ 95 |
| D2 | Lighthouse mobile Product | Performance ≥ 90, SEO ≥ 95 |
| D3 | Lighthouse mobile Blog Detail | Performance ≥ 90, SEO ≥ 95 |
| D4 | Responsif 360 px, 768 px, 1280 px | Tidak ada gulir horizontal; tabel admin memakai kartu di layar kecil |
| D5 | Header keamanan respons | CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy ada |
| D6 | POST `/api/contact` dengan Origin asing | 403 |

## E. Uji rollback

| # | Skenario | Hasil diharapkan |
| --- | --- | --- |
| E1 | Jalankan `./scripts/backup.sh` | Terbentuk direktori berisi `db-*.sql.gz`, `uploads.tar.gz`, `INFO.txt` |
| E2 | Ubah satu data (mis. hapus satu produk) | Perubahan tampak di admin |
| E3 | Jalankan `./scripts/restore.sh <direktori-backup>` | Data kembali seperti saat backup |
| E4 | Jalankan `npm run db:deploy` setelah restore | Skema selaras tanpa error |

## Catatan

- Uji A10 (sanitasi) juga dijaga otomatis oleh `npm run check` — 9 kasus di `lib/sanitize.check.ts`.
- Uji D5 dan D6 sudah dijalankan otomatis oleh `scripts/smoke.sh`.
- Skor Lighthouse fluktuatif: ukur pada build produksi dengan kondisi jaringan yang konsisten.
