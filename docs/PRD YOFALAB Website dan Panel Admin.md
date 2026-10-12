# PRD YOFALAB: Website dan Panel Admin

Oct 12, 2026 · @Venom

## 1. Ringkasan dan Tujuan

YOFALAB Indonesia membutuhkan website company profile dan katalog produk alat kesehatan yang seluruh kontennya (produk, blog, halaman, pesan masuk) bisa dikelola tim sendiri lewat panel admin, tanpa menyentuh kode. Dibangun dengan Next.js (App Router) dan MySQL.

**Masalah:** website saat ini belum punya satu sistem terpusat untuk mengelola produk, blog, halaman, dan pesan dari mitra.

**Sasaran:**

- Tim YOFALAB dapat menambah, mengubah, dan menerbitkan produk dan artikel blog sendiri dalam kurang dari 5 menit per item.
- Pengunjung menemukan produk dan spesifikasinya dengan cepat, lalu menghubungi tim lewat formulir atau WhatsApp.
- Halaman publik cepat dan terindeks baik di mesin pencari (konten blog berbahasa Indonesia, produk berbahasa Inggris).

**Metrik keberhasilan:**

| Metrik | Target |
| --- | --- |
| Lighthouse Performance (mobile), halaman publik | ≥ 90 |
| Lighthouse SEO | ≥ 95 |
| Waktu admin menerbitkan 1 produk baru | ≤ 5 menit |
| Pesan kontak masuk tersimpan di database dan notifikasi email | 100% |
| Seluruh konten halaman saat ini dapat diedit dari admin | 100% |

## 2. Pengguna dan Peran

| Peran | Siapa | Kebutuhan utama |
| --- | --- | --- |
| Pengunjung | Calon mitra, laboratorium, klinik, rumah sakit, distributor | Melihat produk dan spesifikasi, mengunduh brosur, membaca artikel, menghubungi tim |
| Super Admin | Pemilik atau pengembang | Akses penuh: pengguna, pengaturan situs, seluruh modul |
| Editor | Tim konten dan pemasaran | Mengelola produk, kategori, blog, halaman, media; membaca pesan masuk |
| Staf CS (opsional) | Tim penjualan | Hanya membaca dan menandai status pesan kontak |

Semua peran admin masuk lewat satu halaman login `/admin/login`. Hak akses ditentukan oleh peran (RBAC sederhana, 3 peran).

## 3. Situs Publik

Tujuh rute, mengikuti desain yang sudah ada. Header dan footer sama di semua halaman.

| Rute | Halaman | Isi dan perilaku | Sumber data |
| --- | --- | --- | --- |
| `/` | Home | Hero slider dengan CTA "Contact Us"; 3 statistik (2015 Established, 10+ Products, 20+ Partners); blok "Get to Know YOFALAB"; 3 keunggulan (High Quality, Comprehensive Support, Expert Training); carousel Product Category; pencarian blog; 3 blog terbaru | Hero slides, statistik, kategori, blog |
| `/product` | Product | Grid kartu produk 4 kolom (gambar, nama, kategori, tombol Read more); filter kategori; paginasi | Produk, kategori |
| `/product/[slug]` | Detail Produk | Breadcrumb; gambar; judul; deskripsi singkat; kategori dan tag; tab Description (spesifikasi dan aplikasi); tombol Download Brosur; Related products (5 produk sekategori) | Produk, brosur |
| `/blog` | Blog | Grid artikel 3 kolom (kategori, judul, kutipan, penulis, tanggal); paginasi; pencarian | Artikel |
| `/blog/[slug]` | Detail Blog | Header judul, penulis, tanggal, kategori; gambar utama; isi artikel; formulir komentar (Name, Email, Website, Comment) dengan moderasi | Artikel, komentar |
| `/about` | About Us | Foto gedung; profil; Vision; Mission (daftar bernomor); Research and Development | Halaman statis |
| `/contact` | Contact Us | Alamat, email, telepon, WhatsApp; formulir (Name\*, Email\*, Subject, Message\*); tombol Send Message | Pengaturan situs, pesan |

**Aturan lintas halaman**

- Menu aktif ditandai warna ungu dan garis bawah; breadcrumb tampil di semua halaman selain Home.
- Tautan WhatsApp dan email di footer dan Contact Us berasal dari pengaturan situs, bukan hardcode.
- Formulir kontak dan komentar dilindungi honeypot dan pembatasan laju (rate limit), validasi di sisi server.
- Halaman publik dirender di server dengan metadata SEO per halaman (title, description, Open Graph, sitemap.xml, robots.txt, JSON-LD untuk Product dan Article).
- Produk berstatus Draft atau Arsip tidak muncul di publik.

## 4. Panel Admin

Panel admin ada di `/admin`, terpisah dari situs publik, dengan layout sidebar. Semua daftar mendukung pencarian, filter, pengurutan, dan paginasi sisi server. Semua penghapusan memakai konfirmasi dan bersifat soft delete bila data direferensikan.

| Modul | Rute | Fitur | Peran |
| --- | --- | --- | --- |
| Dashboard | `/admin` | Jumlah produk, artikel, pesan baru, komentar menunggu moderasi; 5 pesan terbaru; pintasan "Tambah Produk" dan "Tulis Artikel" | Semua |
| Produk | `/admin/products` | CRUD produk: nama, slug otomatis, kategori, deskripsi singkat, galeri gambar (gambar utama + tambahan), spesifikasi dan aplikasi (editor daftar poin), tag, file brosur PDF, status (Draft, Published, Arsip), urutan tampil, pengaturan SEO. Produk terkait otomatis dari kategori yang sama, bisa diganti manual | Editor, Super Admin |
| Kategori Produk | `/admin/categories` | CRUD kategori (mis. Blood Grouping Reagent, Vacum Blood Collection Series, Hemoglobin Meter), gambar slider, urutan | Editor, Super Admin |
| Blog | `/admin/posts` | CRUD artikel dengan editor rich text (heading, bold, daftar, tautan, gambar); kategori, penulis, gambar utama, tanggal terbit dan penjadwalan, status Draft atau Published, SEO | Editor, Super Admin |
| Komentar | `/admin/comments` | Setujui, tolak, tandai spam, hapus komentar blog | Editor, Super Admin |
| Pesan Kontak | `/admin/messages` | Daftar pesan dari formulir Contact; status Baru, Dibaca, Ditindaklanjuti; catatan internal; ekspor CSV | Semua |
| Halaman | `/admin/pages` | Edit konten About Us (profil, Vision, Mission, R&D) dan blok Home (hero slides, statistik, tiga keunggulan, "Get to Know") | Editor, Super Admin |
| Media | `/admin/media` | Unggah, lihat, ganti nama, hapus gambar dan PDF; dipakai ulang oleh modul lain | Editor, Super Admin |
| Pengaturan Situs | `/admin/settings` | Nama dan logo, alamat, telepon, WhatsApp, email, tautan media sosial, teks footer, SEO default, email penerima notifikasi | Super Admin |
| Pengguna | `/admin/users` | CRUD akun admin, peran, aktif atau nonaktif, reset kata sandi | Super Admin |
| Log Aktivitas | `/admin/logs` | Riwayat siapa mengubah apa dan kapan (create, update, delete, login) | Super Admin |

**Alur penerbitan produk dan artikel:** Draft → pratinjau (`?preview=token`) → Published. Perubahan di Published langsung tayang dan cache halaman terkait dibatalkan (revalidate) otomatis.

## 5. Model Data MySQL

MySQL 8, charset `utf8mb4`, engine InnoDB. Akses lewat Prisma ORM. Semua tabel punya `id` (BIGINT auto increment), `created_at`, `updated_at`. Skrip SQL lengkap ada di file `schema.sql` yang dikirim bersama dokumen ini.

| Tabel | Kolom utama | Relasi |
| --- | --- | --- |
| `users` | name, email (unik), password\_hash, role (SUPER\_ADMIN, EDITOR, CS), is\_active, last\_login\_at | 1-N ke posts, activity\_logs |
| `media` | file\_name, path, mime\_type, size, width, height, alt\_text, uploaded\_by | Dipakai oleh produk, artikel, halaman |
| `product_categories` | name, slug (unik), image\_media\_id, sort\_order | 1-N ke products |
| `products` | category\_id, name, slug (unik), short\_description, specifications (JSON), applications (JSON), brochure\_media\_id, status, sort\_order, seo\_title, seo\_description | N-1 ke kategori; N-N ke tags; 1-N ke product\_images |
| `product_images` | product\_id, media\_id, is\_primary, sort\_order | N-1 ke products dan media |
| `tags` dan `product_tags` | name, slug; pasangan product\_id dan tag\_id | N-N produk dan tag; tabel product\_related (product\_id, related\_product\_id, sort\_order) untuk produk terkait manual |
| `post_categories` | name, slug | 1-N ke posts |
| `posts` | category\_id, author\_id, title, slug (unik), excerpt, content (LONGTEXT HTML), cover\_media\_id, status, published\_at, seo\_title, seo\_description | N-1 ke kategori dan users; 1-N ke comments |
| `comments` | post\_id, name, email, website, body, status (PENDING, APPROVED, SPAM), ip\_hash | N-1 ke posts |
| `contact_messages` | name, email, subject, message, status (NEW, READ, FOLLOWED\_UP), internal\_note, ip\_hash | Berdiri sendiri |
| `pages` | key (HOME, ABOUT), content (JSON: hero slides, statistik, vision, mission, dll.), updated\_by | Berdiri sendiri |
| `site_settings` | key (unik), value (JSON) | Nama situs, kontak, sosmed, footer, SEO default |
| `activity_logs` | user\_id, action, entity, entity\_id, meta (JSON), ip | N-1 ke users |

**Indeks penting:** `products(status, category_id, sort_order)`, `posts(status, published_at)`, `comments(post_id, status)`, `contact_messages(status, created_at)`, FULLTEXT pada `posts(title, excerpt)` untuk pencarian blog.

## 6. Arsitektur Next.js

Satu aplikasi Next.js (App Router) melayani situs publik dan panel admin, dengan satu database MySQL.

| Lapisan | Pilihan | Catatan |
| --- | --- | --- |
| Framework | Next.js 15, React 19, TypeScript | App Router, Server Components untuk halaman publik |
| Styling | Tailwind CSS + token dari Design System | Komponen UI dengan shadcn/ui sebagai dasar |
| Database dan ORM | MySQL 8 + Prisma | Migrasi lewat `prisma migrate` |
| Autentikasi | Auth.js (Credentials), sesi JWT dalam cookie httpOnly | Hash kata sandi argon2 atau bcrypt; middleware melindungi `/admin/*` |
| Validasi | Zod | Dipakai di formulir dan Server Actions |
| Mutasi data | Server Actions untuk admin; Route Handler untuk formulir publik (`/api/contact`, `/api/comments`) | Rate limit per IP |
| Rendering publik | Static + ISR; `revalidateTag` dipanggil setelah admin menyimpan | Halaman cepat tanpa query berulang |
| Editor rich text | Tiptap | Isi disimpan sebagai HTML yang disanitasi |
| Penyimpanan file | Awal: folder `uploads/` di server (Nginx melayani); opsional pindah ke S3 atau R2 | Gambar dioptimalkan dengan `next/image` |
| Email | Nodemailer (SMTP) | Notifikasi pesan kontak ke email penerima |
| Deployment | Node 20+, PM2 atau Docker, Nginx reverse proxy | Environment: `DATABASE_URL`, `AUTH_SECRET`, `SMTP_*`, `UPLOAD_DIR` |

Struktur folder:

```text
src/
  app/
    (public)/            # home, product, blog, about, contact
    admin/               # login, dashboard, products, posts, ...
    api/                 # contact, comments, upload
  components/ui/         # komponen Design System
  components/admin/      # DataTable, FormField, RichTextEditor, MediaPicker
  lib/                   # prisma, auth, validators, revalidate, upload
  server/actions/        # products.ts, posts.ts, settings.ts, ...
prisma/schema.prisma
```

## 7. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
| --- | --- |
| Performa | LCP ≤ 2,5 detik di mobile 4G; gambar WebP/AVIF dengan `next/image`; font dimuat lewat `next/font` |
| SEO | Metadata per halaman, canonical, `sitemap.xml`, `robots.txt`, JSON-LD (Product, Article, Organization), URL berbasis slug |
| Keamanan | Cookie httpOnly dan SameSite; proteksi CSRF bawaan Server Actions; sanitasi HTML artikel; validasi tipe dan ukuran upload (gambar maks. 5 MB, PDF maks. 10 MB); rate limit login (5 percobaan per 15 menit); header keamanan (CSP, HSTS) |
| Privasi | Alamat IP pada komentar dan pesan disimpan sebagai hash; formulir tidak menyimpan data di luar kolom yang dibutuhkan |
| Aksesibilitas | Kontras WCAG AA; navigasi keyboard; label formulir dan `alt` pada semua gambar |
| Responsif | Breakpoint 640, 768, 1024, 1280 px; grid produk 4, 3, 2, 1 kolom |
| Bahasa | Antarmuka admin berbahasa Indonesia; situs publik mengikuti konten yang ada (Inggris untuk halaman statis dan produk, Indonesia untuk blog) |
| Cadangan | Dump MySQL harian dan cadangan folder `uploads/` |
| Observabilitas | Log error server; log aktivitas admin tersimpan di database |

## 8. Fase Pengerjaan dan Kriteria Penerimaan

1. **Fase 1, Fondasi:** setup proyek, Prisma dan migrasi, Design System (token dan komponen dasar), autentikasi admin, layout admin, modul Pengguna dan Pengaturan Situs.
2. **Fase 2, Katalog:** modul Media, Kategori Produk, Produk (termasuk brosur dan galeri); halaman publik Product dan Detail Produk.
3. **Fase 3, Konten:** modul Blog, Komentar, Halaman (Home dan About); halaman publik Home, Blog, Detail Blog, About Us.
4. **Fase 4, Interaksi dan rilis:** Contact Us dan Pesan Kontak, notifikasi email, Dashboard, Log Aktivitas, SEO, uji performa dan keamanan, deployment.

**Kriteria penerimaan**

- [ ] Editor dapat membuat produk Draft, mempratinjau, menerbitkannya, dan produk muncul di `/product` dan di Related products tanpa deploy ulang.
- [ ] Artikel terjadwal terbit otomatis pada waktunya.
- [ ] Formulir Contact menyimpan pesan, mengirim email notifikasi, dan menolak spam sederhana (honeypot dan rate limit).
- [ ] Peran CS tidak dapat membuka modul Produk, Blog, Pengaturan, atau Pengguna (diuji lewat URL langsung).
- [ ] Semua nilai kontak di footer dan Contact Us berubah setelah diedit di Pengaturan Situs.
- [ ] Lighthouse mobile: Performance ≥ 90, SEO ≥ 95 pada Home, Product, dan satu Detail Blog.
- [ ] Tidak ada halaman admin yang dapat diakses tanpa login.

**Di luar cakupan versi 1:** multi-bahasa, keranjang atau pembayaran online, katalog dengan harga, integrasi ERP.
