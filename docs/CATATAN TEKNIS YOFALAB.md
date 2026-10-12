# Catatan Teknis YOFALAB CMS

Dokumen ini untuk tim teknis: arsitektur, cara menjalankan, deploy, backup, dan rollback.

## 1. Tumpukan teknologi

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions, Turbopack) |
| Bahasa | TypeScript 5 |
| Basis data | MySQL 8 |
| ORM | Prisma 6 |
| Autentikasi | NextAuth v5 (credentials + bcrypt), sesi JWT |
| Styling | Tailwind CSS 3 |
| Editor teks | Tiptap 3 |
| Email | Nodemailer |
| Runtime | Node.js 20+ (diuji pada v24.20.0) |

Tidak ada shadcn/ui. Komponen UI ditulis sendiri di `components/` agar sesuai Design System YOFALAB dan tidak menambah dependensi besar.

## 2. Struktur direktori

```
app/
  (public)/          Situs publik: /, /product, /product/[slug], /blog, /blog/[slug], /about, /contact
  admin/             Panel admin (login, forbidden, (panel)/*)
  api/               Route handler: media, contact, comments, messages/export, auth
  layout.tsx         Root layout: font, metadata dasar, skip-link
  sitemap.ts         Sitemap dinamis
  robots.ts          robots.txt
  opengraph-image.tsx  Gambar sosial default
components/
  ui/                Komponen publik
  admin/             Komponen panel admin
  layout/            Header dan Footer publik
lib/
  auth/              Konfigurasi NextAuth, guard, peran
  validators/        Skema Zod (catalog, blog, public, settings, pages, auth)
  sanitize.ts        Sanitasi HTML (whitelist tag)
  settings.ts        Pembacaan `site_settings`
  pages.ts           Pembacaan `pages` (HOME/ABOUT)
  rate-limit.ts      Rate limiter in-memory
  mail.ts            Notifikasi email
  db.ts              Prisma client singleton
  env.ts             Validasi variabel lingkungan
prisma/
  schema.prisma      Skema 15 model + 6 enum
  migrations/        Migrasi SQL
  seed.ts            Data awal (kategori, produk, artikel, halaman, pengaturan, admin)
scripts/
  backup.sh          Dump database + arsip unggahan
  restore.sh         Pulihkan dari hasil backup.sh
  smoke.sh           Uji asap pasca-deploy
```

## 3. Prasyarat

- Node.js 20 atau lebih baru
- MySQL 8 dengan database kosong
- Direktori `uploads/` dapat ditulis proses aplikasi

## 4. Menyiapkan lingkungan

```bash
cp .env.example .env
```

Isi `.env`:

- `DATABASE_URL` — `mysql://user:password@127.0.0.1:3306/yofalab`
- `AUTH_SECRET` — hasil `openssl rand -base64 32`
- `NEXT_PUBLIC_SITE_URL` — URL publik situs

Variabel opsional (SMTP, batas unggahan) dijelaskan di dalam `.env.example`. Modul `lib/env.ts` menolak proses bila variabel wajib tidak ada.

## 5. Instalasi dan migrasi

```bash
npm ci                                   # pasang dependensi
npm run db:generate                      # Prisma client
npm run db:deploy                        # terapkan migrasi (produksi)
SEED_ADMIN_EMAIL=admin@domain.com \
SEED_ADMIN_PASSWORD='<sandi-kuat>' \
  npm run db:seed                        # data awal + Super Admin
```

`npm run db:migrate` hanya untuk pengembangan (membuat migrasi baru).

Seed bersifat idempoten — aman dijalankan berulang kali tanpa menggandakan data.

## 6. Menjalankan

**Pengembangan:**

```bash
npm run dev        # http://localhost:3000
```

**Produksi:**

```bash
npm run build
npm run start
```

Jangan menjalankan `npm run start` di terminal foreground untuk produksi — proses akan memblokir. Jalankan di balik proses manager (systemd, PM2) atau `nohup`, lalu pastikan port benar-benar mendengarkan:

```bash
ss -tlnp | grep 3000
```

## 7. Pemeriksaan mutu

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run check       # self-check sanitasi HTML + kontras WCAG 2 AA
npm run ci          # lint + typecheck + check + build
```

`npm run check` menjalankan dua pemeriksaan berbasis assert tanpa framework:

- `lib/sanitize.check.ts` — 9 kasus sanitasi HTML (skrip, event handler, `javascript:`, teks dengan karakter `<`).
- `lib/contrast.check.ts` — 12 kombinasi warna UI terhadap ambang WCAG 2 AA (4,5:1 teks normal, 3:1 komponen).

Build tanpa database dapat diuji dengan nilai dummy:

```bash
DATABASE_URL="mysql://root:dummy@127.0.0.1:3306/yofalab" \
AUTH_SECRET="dummy-secret-min-16-char" \
NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  npm run build
```

Error `prisma:error` pada tahap *Collecting page data* adalah non-fatal selama build selesai — halaman publik punya fallback dan `force-dynamic` pada detail produk.

## 8. Backup dan rollback

**Backup:**

```bash
./scripts/backup.sh                       # ke ~/backup-yofalab/<tanggal>/
BACKUP_DIR=/mnt/disk2/backup ./scripts/backup.sh
```

Skrip menyimpan `db-<nama>.sql.gz`, `uploads.tar.gz`, dan `INFO.txt` (waktu, commit, ukuran). Retensi 14 backup terakhir.

**Rollback:**

```bash
./scripts/restore.sh ~/backup-yofalab/20261012-101500
```

Skrip meminta konfirmasi nama database sebelum menimpa. Setelah rollback, jalankan `npm run db:deploy` bila skema perlu diselaraskan.

**Jadwal yang disarankan:** harian pukul 02.00 via cron.

```
0 2 * * * cd /path/ke/cms-yofalab && ./scripts/backup.sh >> ~/backup-yofalab/cron.log 2>&1
```

## 9. Uji asap pasca-deploy

```bash
./scripts/smoke.sh https://yofalab.com
```

Memeriksa rute publik (200), `/admin` tanpa sesi dialihkan (307), slug tidak ada (404), header keamanan, dan penolakan POST lintas situs ke `/api/contact` (403).

## 10. Keamanan

- **Header keamanan** (`next.config.ts`): CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. `poweredByHeader` dimatikan.
- **CSRF**: route handler POST publik memverifikasi Origin/Referer se-origin (`lib/request.ts` → `isSameOrigin`). Server Action Next.js sudah punya proteksi sendiri.
- **Sanitasi**: HTML dari editor dan komentar disaring whitelist tag (`lib/sanitize.ts`) sebelum disimpan dan sebelum ditampilkan.
- **Rate limit**: form kontak dan komentar dibatasi 5 permintaan per jam per IP; login dibatasi di `lib/auth/index.ts`.
- **Privasi**: IP pengirim disimpan sebagai hash SHA-256 bersalt `AUTH_SECRET`, bukan alamat mentah.
- **Honeypot**: field tersembunyi (`company` pada kontak, `website2` pada komentar) — bila terisi, permintaan dibalas sukses palsu tanpa disimpan.
- **RBAC**: ditegakkan di server (`requireRole`) dan di UI. `/admin/users` dan `/admin/settings` khusus Super Admin.

Catatan: CSP saat ini mengizinkan `'unsafe-inline'`/`'unsafe-eval'` pada script karena Next.js menyisipkan skrip bootstrap inline. Menaikkannya ke CSP berbasis nonce memerlukan middleware dinamis.

## 11. SEO dan performa

- Canonical URL di setiap halaman (`alternates.canonical`), termasuk detail produk dan artikel.
- JSON-LD: `Organization` + `WebSite` (layout publik), `Product` (detail produk), `BlogPosting` (detail artikel).
- Open Graph dan Twitter Card lengkap, dengan gambar sosial default dari `app/opengraph-image.tsx`.
- ISR 5 menit (`export const revalidate = 300`) pada Home, Product, Blog, About, Contact. Detail produk dan artikel memakai `force-dynamic` karena bergantung data per-slug.
- Gambar memakai `loading="lazy"` dengan dimensi eksplisit untuk mencegah pergeseran tata letak.

## 12. Aksesibilitas

- Skip-link ke `#main` di root layout.
- Landmark `<main>` dan `<nav>` dengan `aria-label`.
- `aria-current="page"` pada menu aktif, `aria-expanded` pada tombol menu seluler.
- Semua input formulir memiliki `<label>` terhubung; pesan galat dikaitkan lewat `aria-describedby`.
- Kontras palet diverifikasi otomatis oleh `npm run check` (semua ≥ 4,5:1 untuk teks normal).
- Gambar wajib memiliki `alt`; ikon dekoratif ditandai `aria-hidden`.

## 13. Alur kerja pengembangan

```bash
npm run lint && npm run typecheck && npm run check && npm run build
git add -A && git commit -m "..." && git push
```

Halaman publik yang membaca database selalu dibungkus fallback (`try-catch` atau `.catch(() => [])`) agar build tetap berhasil ketika database belum tersedia.

## 14. Pemecahan masalah

**`Variabel lingkungan tidak valid`** — `.env` belum lengkap. Bandingkan dengan `.env.example`.

**Build gagal di tahap *Collecting page data* dengan `prisma:error`** — normal bila database belum siap. Pastikan proses tetap selesai; bila build benar-benar berhenti, periksa apakah halaman baru yang membaca database sudah punya fallback.

**Halaman publik menampilkan data kosong setelah deploy** — periksa `DATABASE_URL` dan jalankan `npm run db:seed`.

**Unggahan gagal dengan `EACCES`** — direktori `uploads/` tidak dapat ditulis proses aplikasi. Perbaiki kepemilikan direktori, jangan longgarkan izin seluruh pohon proyek.

**Perubahan konten tidak muncul** — cache ISR 5 menit. `revalidatePath` dipanggil pada setiap aksi simpan, tetapi halaman yang di-cache tetap menunggu jendela revalidasi.

**Login gagal meski sandi benar** — rate limit login mungkin aktif. Tunggu jendela rate limit berakhir.
