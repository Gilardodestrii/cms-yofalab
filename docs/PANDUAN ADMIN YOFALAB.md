# Panduan Admin YOFALAB

Panduan ini untuk tim YOFALAB yang mengelola konten situs melalui panel admin.

## 1. Masuk ke panel admin

1. Buka `https://<domain-situs>/admin/login`.
2. Masukkan email dan kata sandi akun Anda.
3. Setelah masuk, Anda diarahkan ke Dashboard.

Bila lupa kata sandi, minta Super Admin meresetnya dari **Pengguna → Edit → Reset kata sandi**.

**Penting:** ganti kata sandi default (`admin12345`) segera setelah instalasi pertama.

## 2. Peran pengguna

| Peran | Hak akses |
| --- | --- |
| Super Admin | Semua modul, termasuk Pengguna dan Pengaturan. |
| Editor | Produk, Kategori, Blog, Komentar, Halaman, Media, Log; membaca pesan kontak. |
| Staf CS | Hanya Pesan Kontak (baca + ubah status + catatan internal). |

## 3. Menambah produk (≤ 5 menit)

1. Menu **Produk → Tambah Produk**.
2. Isi **Nama**, pilih **Kategori**, tulis **Deskripsi singkat**.
3. Tambahkan **Spesifikasi** (pasangan kunci–nilai, mis. `Kemasan` / `5 mL x 2 botol`) dan **Aplikasi** (satu poin per baris).
4. **Gambar**: klik *Pilih dari media* (unggah dulu di menu **Media** bila belum ada). Gambar pertama otomatis menjadi gambar utama; Anda bisa menandai gambar lain sebagai utama.
5. **Brosur** (opsional): pilih berkas PDF dari pustaka media.
6. **Produk terkait** (opsional): biarkan kosong untuk otomatis memakai produk dari kategori yang sama.
7. Isi **SEO title** dan **SEO description** bila ingin tampilan berbeda di hasil pencarian.
8. Set **Status** ke `PUBLISHED` lalu **Simpan**. Produk langsung tampil di `/product`.

**Tips:** slug dibuat otomatis dari nama. Bila sudah dipakai, sistem menambahkan akhiran angka.

## 4. Mengelola kategori produk

Menu **Kategori**: tambah, ubah, atau hapus kategori. Urutan tampilan diatur oleh **Sort order** (angka kecil tampil lebih dulu).

Kategori yang masih dipakai produk tidak dapat dihapus — pindahkan produknya lebih dulu.

## 5. Menulis artikel blog

1. Menu **Blog → Tulis Artikel**.
2. Isi **Judul** dan **Ringkasan** (ringkasan dipakai di daftar artikel dan hasil pencarian).
3. Tulis isi artikel dengan editor. Tersedia judul, tebal, miring, daftar bernomor, kutipan, tautan, dan gambar.
4. Pilih **Kategori blog** dan **Gambar sampul** (opsional).
5. **Penjadwalan:** isi tanggal terbit di masa depan untuk menerbitkan otomatis. Artikel hanya tampil setelah waktu tersebut lewat.
6. Set **Status** ke `PUBLISHED` lalu **Simpan**.

Editor sudah menyaring HTML berbahaya secara otomatis sebelum disimpan.

## 6. Moderasi komentar

Komentar dari pengunjung berstatus **Menunggu** dan tidak tampil sampai disetujui.

Menu **Komentar** menyediakan aksi:
- **Setujui** — komentar tampil di halaman artikel.
- **Tolak** — disembunyikan.
- **Spam** — ditandai spam.
- **Hapus** — dihapus permanen.

## 7. Pesan kontak

Menu **Pesan Kontak** menampilkan pesan dari formulir `/contact`.

- Ubah status: **Baru → Dibaca → Ditindaklanjuti**.
- Tambahkan **catatan internal** untuk jejak tindak lanjut.
- **Ekspor CSV** mengunduh pesan sesuai filter yang sedang aktif (siap dibuka di Excel).

Bila SMTP belum dikonfigurasi, notifikasi email dilewati namun pesan tetap tersimpan.

## 8. Halaman Home dan About Us

Menu **Halaman** mengatur konten dua halaman:

**Home** — judul & subjudul hero, gambar slide tambahan, tiga statistik (`angka|label`), blok *Get to Know*, dan tiga keunggulan (`judul|isi`).

**About Us** — profil perusahaan, Vision, Mission (satu poin per baris), dan R&D.

Format khusus: setiap baris ditulis `nilai|label` atau `judul|isi` — tanda pipa memisahkan dua bagian.

## 9. Pengaturan situs (Super Admin)

Menu **Pengaturan**:
- **Identitas & SEO**: nama situs, tagline, judul dan deskripsi SEO default, email penerima notifikasi kontak.
- **Kontak**: alamat, telepon, WhatsApp, email. Nilai ini langsung dipakai di halaman `/contact`, footer, dan tombol WhatsApp di detail produk.
- **Footer**: teks hak cipta, deskripsi, tautan media sosial.

Perubahan berlaku di situs publik setelah revalidasi (maksimal 5 menit pada halaman yang di-cache).

## 10. Media

Menu **Media** menyimpan gambar dan PDF. Batas ukuran unggahan 5 MB per berkas.

Format yang didukung: JPG, PNG, WebP, GIF, SVG, dan PDF. Selalu isi **Alt text** pada gambar agar ramah aksesibilitas dan SEO.

## 11. Pengguna (Super Admin)

Menu **Pengguna**: tambah akun, ubah peran, aktif/nonaktifkan, dan reset kata sandi.

Pengamanan bawaan: Super Admin aktif terakhir tidak dapat dinonaktifkan atau dihapus, dan akun yang masih memiliki artikel tidak dapat dihapus.

## 12. Log aktivitas

Menu **Log Aktivitas** mencatat siapa mengubah apa dan kapan. Gunakan filter untuk menelusuri perubahan tertentu.

## 13. Pertanyaan umum

**Perubahan tidak langsung tampil di situs publik.**
Halaman publik memakai cache 5 menit. Tunggu beberapa menit, atau muat ulang dengan `Ctrl+Shift+R`.

**Gambar tidak tampil setelah diunggah.**
Pastikan berkas berada di bawah batas 5 MB dan berekstensi didukung. Cek juga direktori `uploads/` dapat ditulis oleh proses aplikasi.

**Artikel tidak muncul meski status PUBLISHED.**
Periksa tanggal terbitnya. Artikel terjadwal baru tampil setelah waktu tersebut lewat.

**Produk tidak dapat dihapus.**
Produk yang memiliki gambar, tag, atau relasi akan diarsipkan (status `ARCHIVED`) agar data tidak hilang. Hapus gambar dan tag terlebih dahulu bila ingin menghapus permanen.
