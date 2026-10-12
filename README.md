# Panduan Kontribusi YOFALAB

Proyek: website company profile + katalog produk + panel admin YOFALAB Indonesia.
Stack: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + Prisma + MySQL 8.

## Dokumen acuan

- `docs/PRD YOFALAB Website dan Panel Admin.md` — kebutuhan produk.
- `docs/Design System YOFALAB Publik dan Admin.md` — token desain.
- `docs/schema.sql` — skema database acuan.
- `docs/SPRINT PLAN YOFALAB.md` — rencana sprint.

## Menyiapkan lingkungan

1. Pastikan MySQL 8 berjalan (Laragon) dan Node.js 20+.
2. Salin `.env.example` menjadi `.env`, sesuaikan `DATABASE_URL` dan `AUTH_SECRET`.
3. Pasang dependensi dan siapkan database:

   ```bash
   npm install
   npm run db:migrate    # buat tabel dari prisma/schema.prisma
   npm run db:seed       # data awal (kategori, pengaturan situs, Super Admin)
   npm run dev
   ```

4. Buka http://localhost:3000. Panel admin di http://localhost:3000/admin
   (kredensial awal dari `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, default
   `admin@yofalab.com` / `admin12345` — **ganti di produksi**).

## Skrip

| Skrip | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan (Turbopack) |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | Cek TypeScript tanpa emit |
| `npm run format` | Rapikan kode dengan Prettier |
| `npm run db:migrate` | Migrasi Prisma (dev) |
| `npm run db:seed` | Isi data awal (termasuk Super Admin) |
| `npm run db:seed:admin` | Buat/perbarui hanya Super Admin |
| `npm run db:studio` | Prisma Studio |
| `npm run ci` | lint + typecheck + build |

## Konvensi

- **Branch:** `feat/…`, `fix/…`, `chore/…`.
- **Commit:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **Warna:** jangan pakai hex langsung; gunakan token Tailwind (`brand-500`, `ink-900`, dst.).
- **Kontainer:** `container-site` (maks 1230 px) dan `reading-width` (720 px).
- **Validasi:** semua input pengguna divalidasi di server dengan Zod.
- **Akses:** periksa peran di server (bukan hanya menyembunyikan UI).

## Struktur

```
app/
  (public)/        # rute publik dengan header + footer
  admin/
    login/         # halaman login (di luar shell)
    (panel)/       # area admin ber-sidebar: dashboard, media, logs, users, settings
  api/auth/        # route handler Auth.js
  api/media/       # daftar media (JSON) untuk media picker
  uploads/         # route penyaji berkas unggahan
  layout.tsx       # layout root, font, metadata
components/
  layout/          # header, footer
  admin/           # DataTable, FormField, ConfirmDialog, Toast, MediaPicker, sidebar/topbar
  ui/              # komponen Design System publik
lib/
  auth/            # config (Edge), index (Auth.js), guards (requireRole), roles, password
  activity.ts      # pencatat log aktivitas
  rate-limit.ts    # rate limit login (in-memory)
  upload.ts        # validasi + simpan berkas unggahan
  db.ts            # singleton PrismaClient
  env.ts           # validasi env (Zod)
  site.ts          # konfigurasi situs + navigasi (publik & admin)
middleware.ts      # proteksi /admin/* (Edge)
prisma/
  schema.prisma    # selaras 1:1 dengan docs/schema.sql
  seed.ts          # data awal + Super Admin
  seed-admin.ts    # seeder Super Admin saja
docs/              # PRD, design system, sprint plan, schema.sql
uploads/           # berkas media terunggah (diabaikan git)
```

## Autentikasi & RBAC

- Login kredensial (email + kata sandi bcrypt) via Auth.js v5, sesi JWT di cookie httpOnly.
- Middleware melindungi `/admin/*`; otorisasi per-peran ditegakkan di server (`requireRole`).
- Peran: `SUPER_ADMIN` (penuh), `EDITOR` (konten + media), `CS` (pesan saja).
- Rate limit login: 5 percobaan / 15 menit per IP (IP di-hash untuk kunci rate limit).
- Setiap login/logout dan aksi create/update/delete/upload dicatat di `activity_logs`.

