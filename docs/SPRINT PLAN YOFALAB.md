# Sprint Plan YOFALAB: Website dan Panel Admin

Turunan dari `PRD YOFALAB Website dan Panel Admin.md`, `Design System YOFALAB Publik dan Admin.md`, dan `schema.sql`.

## Ringkasan

| Item | Nilai |
| --- | --- |
| Total fase | 4 |
| Total sprint | 9 (sprint 1 minggu) |
| Estimasi total | ~11 minggu untuk 1 developer full-stack (dapat dipadatkan bila tim lebih besar) |
| Ritme | Sprint 1 minggu: planning 1 jam, review + retro 1 jam di hari terakhir |
| Definition of Done | Kode lolos TypeScript + lint, ada test untuk logika kritis, lolos review, ter-deploy ke staging, dokumentasi diperbarui |

### Definition of Done (berlaku semua task)

1. Fitur berjalan sesuai acceptance criteria pada PRD.
2. Tidak ada error TypeScript (`tsc --noEmit`) dan lint bersih.
3. Validasi input di server (Zod) untuk semua input pengguna.
4. Kontrol akses diperiksa di server (bukan hanya UI).
5. Halaman publik baru sudah punya metadata SEO dan masuk `sitemap.xml`.
6. Sudah diuji manual di viewport 360 px, 768 px, dan 1280 px.
7. Sudah di-deploy ke staging dan disetujui Product Owner (PO).

---

## Timeline Global

| Sprint | Fokus | Fase | Estimasi |
| --- | --- | --- | --- |
| 0 | Kick-off, setup repo, konfirmasi lingkup | Fondasi | 2-3 hari |
| 1 | Fondasi proyek: Next.js, Prisma, DB, Tailwind, CI | Fondasi | 1 minggu |
| 2 | Autentikasi, RBAC, shell admin, media, log aktivitas | Fondasi | 1 minggu |
| 3 | Produk: kategori, CRUD, galeri, spesifikasi, brosur | Katalog | 1 minggu |
| 4 | Situs publik: Home, Product, Product Detail | Katalog | 1 minggu |
| 5 | Blog: CRUD, rich text, publikasi terjadwal | Konten | 1 minggu |
| 6 | Halaman publik Blog, Blog Detail, About, Contact + komentar | Konten | 1 minggu |
| 7 | Pengaturan situs, halaman dinamis, pengguna, pesan kontak, ekspor CSV | Interaksi | 1 minggu |
| 8 | SEO, performa, keamanan, aksesibilitas | Rilis | 1 minggu |
| 9 | QA end-to-end, konten awal, pelatihan, rilis | Rilis | 1 minggu |

---

## Sprint 0 — Kick-off dan Persiapan (2-3 hari)

**Tujuan:** lingkup terkunci, lingkungan kerja siap, tidak ada blocker teknis di sprint 1.

**Task**
- [ ] Review PRD + Design System bersama PO; catat daftar pertanyaan terbuka.
- [ ] Konfirmasi kebutuhan email notifikasi (SMTP kredensial, alamat pengirim, email penerima).
- [ ] Konfirmasi strategi penyimpanan media (`uploads/` lokal vs object storage) untuk produksi.
- [ ] Konfirmasi apakah komentar blog wajib ada di rilis pertama (bila tidak, tunda ke sprint lanjutan).
- [ ] Siapkan akses: repo Git, MySQL 8 (Laragon), Node.js LTS, akun hosting/staging.
- [ ] Tentukan konvensi: nama branch (`feat/`, `fix/`), commit (Conventional Commits), alur PR.
- [ ] Buat papan tugas (GitHub Projects / Trello) berisi seluruh sprint di dokumen ini.

**Deliverable:** dokumen lingkup terkonfirmasi + akses lengkap.

**Risiko:** keputusan object storage tertunda -> pakai abstraksi adapter media sejak awal agar mudah ditukar.

---

## Sprint 1 — Fondasi Proyek (1 minggu)

**Tujuan:** proyek Next.js berjalan, terhubung MySQL lewat Prisma, desain token siap dipakai.

**Task**
- [x] Inisialisasi Next.js (App Router) + TypeScript + ESLint + Prettier.
- [x] Setup Tailwind CSS dan impor seluruh token dari Design System (`tailwind.config.ts` lengkap: colors, fontFamily, borderRadius, boxShadow, screens).
- [x] Impor font Poppins (judul) dan Nunito (isi) via `next/font`.
- [ ] Setup shadcn/ui dan komponen dasar (Button, Input, Table, Dialog, Badge, Toast). Komponen custom setara lengkap (Button, DataTable, ConfirmDialog, Toast, FormField, Badge) tapi tanpa shadcn/ui.
- [x] Setup Prisma + MySQL, tulis `schema.prisma` **selaras 1:1 dengan `docs/schema.sql`** (15 tabel).
- [x] Jalankan migrasi awal; verifikasi dengan `schema.sql` (FK, indeks, FULLTEXT `ft_posts`).
- [x] Buat `lib/db.ts` (Prisma singleton) dan `lib/env.ts` (validasi env dengan Zod).
- [x] Buat layout dasar publik (Header, Footer, container 1230 px, max-width baca 720 px).
- [x] Halaman placeholder 7 rute publik agar navigasi bisa diuji.
- [x] Setup CI: lint + `tsc --noEmit` + build pada setiap PR.

**Acceptance criteria**
- `npm run dev` dan `npm run build` sukses.
- Migrasi menghasilkan tabel identik dengan `schema.sql` (dicek dengan `SHOW CREATE TABLE`).
- Token warna dan tipografi tampil benar pada halaman contoh yang memuat semua varian tombol.

**Risiko:** perbedaan tipe Prisma vs `ENUM` MySQL -> pastikan enum Prisma (`SUPER_ADMIN`, `EDITOR`, `CS`, dll.) persis sama.

---

## Sprint 2 — Autentikasi, RBAC, Shell Admin (1 minggu)

**Tujuan:** admin bisa login, hak akses ditegakkan, unggah media dan log aktivitas berjalan.

**Task**
- [x] Auth.js (Credentials) + JWT di cookie httpOnly; halaman `/admin/login`.
- [x] Hash kata sandi (bcrypt/argon2); skrip seed Super Admin pertama.
- [x] Middleware proteksi `/admin/*`; redirect ke login bila belum terautentikasi.
- [x] Helper `requireRole()` untuk 3 peran (Super Admin, Editor, CS).
- [x] Layout admin: sidebar 248 px `brand-700`, header, breadcrumb, menu aktif, responsif (drawer di mobile).
- [x] Dashboard dasar: kartu jumlah (produk, artikel, pesan baru, komentar menunggu) + 5 pesan terbaru + pintasan "Tambah Produk"/"Tulis Artikel".
- [x] Modul Media `/admin/media`: unggah, daftar grid, ganti nama, hapus, salin URL; validasi tipe & ukuran file; simpan width/height.
- [x] Media picker (dialog) untuk dipakai ulang modul lain.
- [x] Log aktivitas: helper pencatat (create, update, delete, login) + halaman `/admin/logs` dengan filter.
- [x] Rate limit login: 5 percobaan / 15 menit, hash IP.
- [x] Komponen bersama: DataTable (cari, filter, urut, paginasi server-side), ConfirmDialog, Toast, FormField.

**Acceptance criteria**
- [x] Login gagal 6 kali berturut-turut diblokir sementara.
- [x] Editor tidak bisa membuka `/admin/users` dan `/admin/settings` (redirect 403/forbidden).
- [x] Setiap create/update/delete dan login tercatat di `activity_logs`.
- [x] Unggah file `.exe` ditolak; unggah JPG/PNG/PDF sukses dan tampil di grid.

**Risiko:** lupa cek peran di server -> tambahkan test untuk setiap server action.

---

## Sprint 3 — Produk dan Kategori (1 minggu)

**Tujuan:** tim dapat mengelola katalog lengkap dari admin.

**Task**
- [x] Modul Kategori Produk `/admin/categories`: CRUD, slug otomatis, gambar slider (media picker), urutan, konfirmasi hapus.
- [x] Modul Produk `/admin/products`: CRUD lengkap — nama, slug otomatis (unik), kategori, deskripsi singkat, status (Draft/Published/Arsip), urutan, SEO (title + description).
- [x] Galeri gambar: gambar utama + tambahan, atur urutan, tandai `is_primary`.
- [x] Editor daftar poin untuk `specifications` (`[{label, value}]`) dan `applications` (`[]`) — simpan sebagai JSON.
- [x] Tag: buat/pilih tag, relasi `product_tags`.
- [x] Brosur PDF: unggah via media picker.
- [x] Produk terkait: otomatis dari kategori sama, bisa diganti manual (`product_related`).
- [x] Soft delete untuk data yang direferensikan; hard delete hanya bila aman.
- [x] Revalidasi cache saat produk/kategori berubah (pakai `revalidatePath`; `revalidateTag` belum dipakai karena belum ada cache tag).

**Acceptance criteria**
- Admin dapat menerbitkan 1 produk baru dalam <= 5 menit (diuji dengan stopwatch).
- Slug bentrok otomatis diberi sufiks unik tanpa error.
- Produk Draft/Arsip tidak pernah tampil di query publik (diuji dengan test).

**Risiko:** validasi JSON spesifikasi -> validasi Zod yang ketat sebelum simpan.

---

## Sprint 4 — Situs Publik: Home, Product, Product Detail (1 minggu)

**Tujuan:** tiga halaman publik utama sesuai desain (`Home.png`, `Product.png`, `Product Detail.png`).

**Task**
- [ ] `/` Home: hero slider (dari `pages.HOME`), 3 statistik (2015 Established, 10+ Products, 20+ Partners), blok "Get to Know YOFALAB", 3 keunggulan (High Quality, Comprehensive Support, Expert Training), carousel Product Category, pencarian blog, 3 blog terbaru, CTA "Contact Us".
- [ ] `/product`: grid kartu produk (4-3-2-1 kolom per breakpoint), filter kategori, pencarian, paginasi.
- [ ] `/product/[slug]`: galeri gambar, deskripsi, tab Description + spesifikasi, daftar aplikasi, tombol unduh brosur, CTA WhatsApp/Contact, produk terkait.
- [ ] Data diambil via Prisma dengan Static + ISR; `generateMetadata` per halaman.
- [ ] Komponen bersama: ProductCard, Pagination, Breadcrumb, Tabs, SearchInput.
- [ ] Skeleton/loading state dan empty state.

**Acceptance criteria**
- Semua halaman cocok dengan screenshot desain (review visual PO).
- Lighthouse mobile Performance >= 90 untuk ketiga halaman.
- Gambar memakai `next/image` dengan ukuran responsif.

**Risiko:** hero slider berat -> lazy-load slide non-aktif dan optimalkan gambar.

---

## Sprint 5 — Blog dan Editor Rich Text (1 minggu)

**Tujuan:** tim dapat menulis dan menjadwalkan artikel.

**Task**
- [ ] Kategori blog di `/admin/posts`: CRUD sederhana (`post_categories`).
- [ ] Modul Blog `/admin/posts`: CRUD artikel dengan Tiptap (heading, bold, italic, daftar, tautan, gambar, kutipan).
- [ ] Field: judul, slug otomatis, kategori, penulis (default pengguna aktif), gambar utama, ringkasan (excerpt), tanggal terbit, penjadwalan, status Draft/Published, SEO.
- [ ] Sanitasi HTML konten sebelum simpan/tampil (cegah XSS).
- [ ] Revalidasi cache saat artikel diterbitkan/diubah.

**Acceptance criteria**
- Artikel berstatus Published dengan `published_at` di masa depan tidak tampil sampai waktunya tiba.
- Konten berisi skrip berbahaya tersimpan sebagai teks aman, bukan dieksekusi.

**Risiko:** XSS dari editor -> sanitasi di server dengan whitelist tag.

---

## Sprint 6 — Blog Publik, About, Contact, Komentar (1 minggu)

**Tujuan:** halaman publik konten dan interaksi pengunjung selesai.

**Task**
- [ ] `/blog`: daftar artikel, filter kategori, pencarian, paginasi.
- [ ] `/blog/[slug]`: konten, info penulis + tanggal, artikel terkait, formulir komentar.
- [ ] `/about`: profil, Vision, Mission, R&D (dari `pages.ABOUT`).
- [ ] `/contact`: info kontak (alamat, telepon, WhatsApp, email) + formulir (nama, email, subjek, pesan) via Route Handler + Zod.
- [ ] Formulir komentar dan kontak: honeypot + rate limit + validasi server + hash IP.
- [ ] Simpan pesan ke `contact_messages`; komentar masuk sebagai `PENDING`.
- [ ] Notifikasi email untuk pesan kontak baru (Nodemailer).
- [ ] Moderasi komentar `/admin/comments`: setujui, tolak, tandai spam, hapus.

**Acceptance criteria**
- Pesan kontak tersimpan 100% dan email terkirim (dicek log/uji terima).
- Komentar hanya tampil setelah disetujui.
- Honeypot menghentikan bot tanpa mengganggu pengguna nyata.

**Risiko:** email gagal kirim -> bungkus dengan retry dan catat kegagalan agar pesan tetap tersimpan.

---

## Sprint 7 — Pengaturan, Halaman Dinamis, Pengguna, Pesan (1 minggu)

**Tujuan:** seluruh konten saat ini dapat diedit dari admin (target PRD 100%).

**Task**
- [ ] `/admin/settings`: nama & logo, alamat, telepon, WhatsApp, email, tautan media sosial, teks footer, SEO default, email penerima notifikasi.
- [ ] `/admin/pages`: editor blok Home (hero slides dengan gambar + tautan, statistik, tiga keunggulan, blok "Get to Know") dan About Us (profil, Vision, Mission, R&D).
- [ ] `/admin/users`: CRUD akun, peran, aktif/nonaktif, reset kata sandi (khusus Super Admin).
- [ ] `/admin/messages`: daftar, detail, ubah status (Baru/Dibaca/Ditindaklanjuti), catatan internal, filter + paginasi.
- [ ] Ekspor pesan kontak ke CSV (hormati filter aktif).
- [ ] Terapkan pengaturan ke Header/Footer/detail produk (email & WhatsApp langsung memakai nilai dari admin).

**Acceptance criteria**
- Mengubah alamat/telepon/footer di admin langsung terlihat di situs publik setelah revalidasi.
- Menambah/mengubah hero slide di admin mengubah halaman Home.
- CSV dapat dibuka di Excel tanpa karakter rusak (UTF-8 BOM untuk locale Indonesia).

**Risiko:** struktur JSON `pages.content` fleksibel -> kunci skema Zod per tipe halaman.

---

## Sprint 8 — SEO, Performa, Keamanan, Aksesibilitas (1 minggu)

**Tujuan:** memenuhi metrik non-fungsional PRD.

**Task**
- [ ] `sitemap.xml` dinamis, `robots.txt`, canonical URL.
- [ ] JSON-LD: `Product` untuk halaman produk, `Article` untuk blog.
- [ ] Metadata lengkap: title, description, Open Graph, Twitter Card, gambar sosial default.
- [ ] Audit performa: optimasi gambar, lazy-load, ukuran bundle, caching ISR; target LCP <= 2,5 dtk.
- [ ] Keamanan: perlindungan CSRF, header keamanan, sanitasi input, rate limit form publik.
- [ ] Audit aksesibilitas WCAG 2 AA: kontras, fokus keyboard terlihat, label formulir, landmark ARIA, alt text.
- [ ] Perbaikan hasil Lighthouse (target Performance >= 90, SEO >= 95 di mobile).

**Acceptance criteria**
- Lighthouse mobile: Performance >= 90, SEO >= 95 pada Home, Product, dan Blog Detail.
- Semua halaman publik dapat dinavigasi penuh dengan keyboard.
- Tidak ada error di konsol dan tidak ada mixed-content.

**Risiko:** skor Lighthouse fluktuatif -> ukur dengan build produksi dan kondisi jaringan konsisten.

---

## Sprint 9 — QA End-to-End, Konten Awal, Pelatihan, Rilis (1 minggu)

**Tujuan:** rilis produksi dengan data awal dan tim siap memakai panel.

**Task**
- [ ] Uji end-to-end: login, CRUD produk/kategori/blog/halaman/pengguna, moderasi komentar, pesan kontak, ekspor CSV, unggah media.
- [ ] Uji lintas peran: Super Admin, Editor, CS memastikan batas akses benar.
- [ ] Isi konten awal: kategori Blood Grouping Reagent, Vacum Blood Collection Series, Hemoglobin Meter; minimal 3 artikel; halaman About; pengaturan kontak & footer.
- [ ] Seed data (Prisma) untuk Super Admin + data awal.
- [ ] Backup database + prosedur rollback.
- [ ] Deploy produksi, uji asap, pasang pemantauan error.
- [ ] Dokumentasi: panduan admin (cara tambah produk, tulis artikel, moderasi komentar) + catatan teknis.
- [ ] Pelatihan tim (1 sesi) dan serah terima.

**Acceptance criteria**
- Semua modul PRD berfungsi di produksi.
- Tim YOFALAB dapat menerbitkan 1 produk baru sendiri dalam <= 5 menit.
- Backup terjadwal dan prosedur rollback diuji.

---

## Matriks Keterlacakan (PRD -> Sprint)

| Kebutuhan PRD | Sprint |
| --- | --- |
| Situs publik 7 rute | 1 (kerangka), 4, 6 |
| Home (hero, statistik, keunggulan, kategori, blog) | 4, 7 |
| Product + Detail (grid, filter, spesifikasi, brosur, terkait) | 3, 4 |
| Blog + Detail (rich text, penjadwalan, komentar) | 5, 6 |
| About Us (profil, Vision, Mission, R&D) | 6, 7 |
| Contact Us (formulir, honeypot, rate limit, email) | 6 |
| Admin: Dashboard | 2 |
| Admin: Produk & Kategori | 3 |
| Admin: Blog & Komentar | 5, 6 |
| Admin: Pesan Kontak + CSV | 7 |
| Admin: Halaman | 7 |
| Admin: Media | 2 |
| Admin: Pengaturan Situs | 7 |
| Admin: Pengguna | 7 |
| Admin: Log Aktivitas | 2 |
| RBAC 3 peran | 2 |
| SEO (sitemap, robots, JSON-LD, metadata) | 1, 4, 5, 8 |
| Performa & Aksesibilitas | 4, 8 |
| Keamanan (CSRF, sanitasi, rate limit) | 2, 5, 6, 8 |

## Backlog Rilis Berikutnya

- Komentar bersarang (threading) dan balasan admin.
- Pencarian global di seluruh situs (produk + blog).
- Versi bahasa (ID/EN) penuh dengan pemilih bahasa.
- Integrasi WA Business API untuk notifikasi real-time.
- Statistik kunjungan ringan di dashboard.
- Arsitektur multi-bahasa konten produk/blog (bila diperlukan mitra internasional).

## Risiko Utama dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Skema Prisma tidak persis sama dengan `schema.sql` | Bug data sulit dilacak | Uji banding `SHOW CREATE TABLE` di sprint 1 |
| Konten dari editor mengandung XSS | Keamanan | Sanitasi server (whitelist tag) + test |
| Foto produk beresolusi besar | Performa | Kompresi + `next/image` + batas ukuran unggah |
| Email notifikasi gagal | Pesan tidak terpantau | Pesan selalu tersimpan; email dengan retry dan log |
| Scope creep (komentar/fitur tambahan) | Jadwal | Komentar bersifat opsional; fitur tambahan masuk backlog |
| Satu developer | Jadwal | Sprint dirancang berurutan; kurangi cakupan sebelum menambah durasi |
