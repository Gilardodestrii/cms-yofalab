import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

/**
 * Data awal YOFALAB, selaras dengan bagian "Data awal" pada `docs/schema.sql`
 * dan Sprint 9 (konten awal + seed).
 *
 * Idempoten: aman dijalankan berulang kali (semua memakai `upsert`).
 * Gambar produk/artikel sengaja tidak diisi karena berkas media diunggah lewat
 * panel admin; kartu tanpa gambar memakai placeholder setelah render.
 */

const PRODUCT_CATEGORIES = [
  {
    name: "Blood Grouping Reagent",
    slug: "blood-grouping-reagent",
    sortOrder: 1,
  },
  {
    name: "Vacum Blood Collection Series",
    slug: "vacum-blood-collection-series",
    sortOrder: 2,
  },
  {
    name: "Hemoglobin Meter",
    slug: "hemoglobin-meter",
    sortOrder: 3,
  },
];

const PRODUCTS: {
  slug: string;
  categorySlug: string;
  name: string;
  shortDescription: string;
  specifications: { key: string; value: string }[];
  applications: string[];
  tags: string[];
  sortOrder: number;
}[] = [
  {
    slug: "blood-grouping-reagent-anti-a-anti-b",
    categorySlug: "blood-grouping-reagent",
    name: "Blood Grouping Reagent Anti-A / Anti-B",
    shortDescription:
      "Reagen monoklonal Anti-A dan Anti-B untuk penentuan golongan darah ABO pada uji slide maupun tabung.",
    specifications: [
      { key: "Kemasan", value: "5 mL x 2 botol per kotak" },
      { key: "Metode", value: "Slide aglutinasi dan tube test" },
      { key: "Penyimpanan", value: "2-8 C, hindari pembekuan" },
      { key: "Masa simpan", value: "12 bulan sejak tanggal produksi" },
    ],
    applications: [
      "Pemeriksaan golongan darah rutin di laboratorium klinik",
      "Skrining pra-transfusi dan cross-matching",
      "Pemeriksaan donasi darah di Unit Transfusi Darah",
    ],
    tags: ["Reagen", "ABO", "Imunohematologi"],
    sortOrder: 1,
  },
  {
    slug: "anti-d-rhesus-reagent",
    categorySlug: "blood-grouping-reagent",
    name: "Anti-D (Rhesus) Reagent",
    shortDescription:
      "Reagen Anti-D monoklonal untuk penentuan status Rhesus positif atau negatif pada pemeriksaan imunohematologi.",
    specifications: [
      { key: "Kemasan", value: "10 mL per botol" },
      { key: "Metode", value: "Slide, tube, dan microplate" },
      { key: "Penyimpanan", value: "2-8 C" },
      { key: "Masa simpan", value: "12 bulan sejak tanggal produksi" },
    ],
    applications: [
      "Penentuan status Rhesus pada calon pendonor",
      "Pemeriksaan ibu hamil untuk pencegahan inkompatibilitas Rh",
      "Pelengkap pemeriksaan golongan darah ABO",
    ],
    tags: ["Reagen", "Rhesus", "Imunohematologi"],
    sortOrder: 2,
  },
  {
    slug: "vacuum-blood-collection-tube-edta",
    categorySlug: "vacum-blood-collection-series",
    name: "Vacuum Blood Collection Tube EDTA (Lavender Top)",
    shortDescription:
      "Tabung vakum tutup ungu dengan antikoagulan EDTA K2/K3 untuk pemeriksaan hematologi rutin.",
    specifications: [
      { key: "Volume", value: "2 mL, 3 mL, dan 4 mL" },
      { key: "Ukuran", value: "13 x 75 mm dan 13 x 100 mm" },
      { key: "Antikoagulan", value: "EDTA K2/K3" },
      { key: "Sterilitas", value: "Steril, sekali pakai, tertutup vakum" },
    ],
    applications: [
      "Pemeriksaan darah lengkap (hematologi rutin)",
      "Penghitungan trombosit dan pemeriksaan HbA1c",
      "Analisis sel darah pada analyzer otomatis",
    ],
    tags: ["Tabung Vakum", "EDTA", "Hematologi"],
    sortOrder: 1,
  },
  {
    slug: "vacuum-blood-collection-tube-clot-activator",
    categorySlug: "vacum-blood-collection-series",
    name: "Vacuum Blood Collection Tube Clot Activator (Red Top)",
    shortDescription:
      "Tabung vakum tutup merah tanpa antikoagulan untuk memperoleh serum pada pemeriksaan kimia klinik.",
    specifications: [
      { key: "Volume", value: "3 mL, 5 mL, dan 10 mL" },
      { key: "Ukuran", value: "13 x 75 mm, 13 x 100 mm, 16 x 100 mm" },
      { key: "Aditif", value: "Clot activator (silika)" },
      { key: "Sterilitas", value: "Steril, sekali pakai, tertutup vakum" },
    ],
    applications: [
      "Pemeriksaan kimia klinik (glukosa, kolesterol, fungsi hati)",
      "Pemeriksaan imunologi dan serologi",
      "Pemeriksaan hormon dan penanda tumor",
    ],
    tags: ["Tabung Vakum", "Serum", "Kimia Klinik"],
    sortOrder: 2,
  },
  {
    slug: "hemoglobin-meter-portable",
    categorySlug: "hemoglobin-meter",
    name: "Hemoglobin Meter Portable",
    shortDescription:
      "Alat ukur hemoglobin portabel dengan strip sekali pakai, hasil pembacaan cepat dan mudah dibaca di lapangan.",
    specifications: [
      { key: "Rentang ukur", value: "0-25 g/dL" },
      { key: "Waktu ukur", value: "Sekitar 5 detik" },
      { key: "Sampel", value: "Darah kapiler atau vena" },
      { key: "Daya", value: "Baterai AAA, indikator baterai lemah" },
    ],
    applications: [
      "Skrining anemia di puskesmas dan posyandu",
      "Pemeriksaan hemoglobin cepat di klinik pratama",
      "Skrining kesehatan ibu hamil dan anak sekolah",
    ],
    tags: ["Hemoglobin", "Portabel", "Skrining"],
    sortOrder: 1,
  },
];

const POSTS: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  daysAgo: number;
  seoDescription: string;
}[] = [
  {
    slug: "mengenal-golongan-darah-abo-rhesus",
    title: "Mengenal Golongan Darah ABO dan Rhesus Sebelum Transfusi",
    excerpt:
      "Pemeriksaan golongan darah bukan sekadar formalitas. Simak apa yang diperiksa, bagaimana reagen bekerja, dan mengapa status Rhesus wajib diketahui.",
    content:
      "<h2>Mengapa golongan darah penting</h2><p>Golongan darah ditentukan oleh keberadaan antigen pada permukaan sel darah merah. Sistem yang paling umum dipakai adalah <strong>ABO</strong> dan <strong>Rhesus</strong>. Ketidakcocokan keduanya dapat memicu reaksi transfusi yang berbahaya.</p><h2>Bagaimana pemeriksaan dilakukan</h2><p>Reagen Anti-A, Anti-B, dan Anti-D diteteskan pada sampel sel darah merah. Bila terjadi aglutinasi (penggumpalan), antigen pada sampel bereaksi dengan antibodi di dalam reagen. Hasil kombinasi aglutinasi inilah yang menentukan golongan darah.</p><ul><li><strong>A</strong> bereaksi dengan Anti-A</li><li><strong>B</strong> bereaksi dengan Anti-B</li><li><strong>AB</strong> bereaksi dengan keduanya</li><li><strong>O</strong> tidak bereaksi dengan keduanya</li></ul><h2>Peran status Rhesus</h2><p>Pemeriksaan Anti-D menandai ada atau tidaknya antigen D. Sekitar 85% populasi Indonesia bergolongan Rhesus positif. Bagi ibu hamil, status Rhesus menentukan perlu atau tidaknya pencegahan inkompatibilitas Rh pada kehamilan berikutnya.</p><h2>Penyimpanan reagen</h2><p>Simpan reagen pada suhu 2-8 °C, jangan dibekukan, dan perhatikan tanggal kedaluwarsa. Reagen yang keruh atau berubah warna sebaiknya tidak dipakai.</p>",
    daysAgo: 20,
    seoDescription:
      "Penjelasan golongan darah ABO dan Rhesus: cara pemeriksaan, peran reagen Anti-A/Anti-B/Anti-D, dan kapan transfusi perlu cek ulang.",
  },
  {
    slug: "panduan-memilih-tabung-vakum-pengambilan-darah",
    title: "Panduan Memilih Tabung Vakum Sesuai Jenis Pemeriksaan",
    excerpt:
      "Warna tutup tabung bukan sekadar penanda visual. Setiap warna mewakili aditif berbeda yang menentukan jenis sampel: serum, plasma, atau darah utuh.",
    content:
      "<h2>Warna tutup menentukan hasil</h2><p>Salah memilih tabung membuat sampel tidak layak periksa dan pasien harus diambil darah ulang. Berikut panduan ringkas sesuai urutan pengambilan.</p><ul><li><strong>Tutup merah</strong> — tanpa antikoagulan, menghasilkan serum untuk kimia klinik.</li><li><strong>Tutup ungu (EDTA)</strong> — mengikat kalsium, menghasilkan darah utuh untuk hematologi.</li><li><strong>Tutup biru (sitrat)</strong> — untuk pemeriksaan koagulasi seperti PT/aPTT.</li><li><strong>Tutup hijau (heparin)</strong> — plasma untuk pemeriksaan kimia tertentu.</li></ul><h2>Urutan pengambilan</h2><p>Ambil tabung tanpa aditif lebih dulu, lalu yang mengandung aditif. Bersihkan area tusukan, biarkan alkohol mengering, dan hindari hemolisis dengan tidak mengocok tabung terlalu keras.</p><h2>Penyimpanan dan transportasi</h2><p>Kirim sampel secepat mungkin. Untuk pemeriksaan tertentu, tabung perlu dijaga suhu atau diletakkan segera di es. Catat waktu pengambilan agar hasil dapat ditafsirkan dengan benar.</p>",
    daysAgo: 12,
    seoDescription:
      "Panduan memilih tabung vakum pengambilan darah berdasarkan warna tutup, aditif, dan jenis pemeriksaan laboratorium.",
  },
  {
    slug: "skrining-anemia-dengan-hemoglobin-meter",
    title: "Skrining Anemia dengan Hemoglobin Meter Portable",
    excerpt:
      "Deteksi anemia lebih cepat dengan pengukuran hemoglobin di tempat. Ini pertimbangan memilih alat, membaca hasil, dan menjaganya tetap akurat.",
    content:
      "<h2>Anemia dan deteksi dini</h2><p>Anemia terjadi saat kadar hemoglobin di bawah nilai normal menurut umur dan jenis kelamin. Skrining cepat di fasilitas kesehatan tingkat pertama mempercepat rujukan pada kasus yang memerlukan penanganan lanjut.</p><h2>Keunggulan pengukuran portabel</h2><p>Hemoglobin meter portabel hanya memerlukan sampel darah kapiler sedikit dan memberi hasil dalam hitungan detik, sehingga pemeriksaan bisa dilakukan secara massal di posyandu maupun sekolah.</p><h2>Menjaga akurasi pengukuran</h2><ul><li>Simpan strip di wadah tertutup dan jauh dari kelembapan.</li><li>Bersihkan ujung alat pengukur sesuai prosedur, hindari kontaminasi silang.</li><li>Periksa kontrol kualitas berkala dengan larutan kontrol.</li><li>Ganti baterai saat indikator lemah agar pembacaan tidak menurun.</li></ul><h2>Kapan perlu pemeriksaan laboratorium lanjutan</h2><p>Bila hasil menunjukkan anemia, dokter biasanya meminta pemeriksaan indeks eritrosit dan status besi untuk menentukan penyebabnya.</p>",
    daysAgo: 5,
    seoDescription:
      "Cara kerja hemoglobin meter portabel untuk skrining anemia: pertimbangan alat, tips akurasi, dan kapan perlu pemeriksaan lanjutan.",
  },
];

const ABOUT_CONTENT = {
  profile:
    "YOFALAB Indonesia adalah perusahaan yang bergerak di bidang penyediaan alat kesehatan dan reagen laboratorium. Kami melayani rumah sakit, laboratorium klinik, puskesmas, hingga Unit Transfusi Darah di berbagai daerah di Indonesia.\n\nSejak berdiri, kami berkomitmen menghadirkan produk berkualitas dengan dukungan distributor resmi, penyimpanan sesuai standar, dan layanan purna jual yang responsif.",
  vision:
    "Menjadi mitra terpercaya penyediaan alat kesehatan dan reagen laboratorium di Indonesia.",
  mission: [
    "Menyediakan produk alat kesehatan dan reagen laboratorium yang berkualitas, aman, dan bersertifikat.",
    "Memberikan layanan teknis dan konsultasi bagi mitra laboratorium.",
    "Menjaga ketersediaan stok dan ketepatan waktu pengiriman.",
    "Mengembangkan tim yang kompeten dan berorientasi pada kebutuhan pelanggan.",
  ],
  research:
    "Tim kami mengikuti perkembangan metode pemeriksaan laboratorium dan terus menjalin kerja sama dengan principal produsen untuk menghadirkan teknologi pemeriksaan yang relevan dengan kebutuhan laboratorium di Indonesia.",
};

const HOME_CONTENT = {
  heroTitle: "Alat Kesehatan dan Reagen Laboratorium",
  heroSubtitle:
    "Mitra penyediaan blood grouping reagent, tabung vakum, dan hemoglobin meter untuk laboratorium di Indonesia.",
  slides: [],
  stats: [
    { value: "10+", label: "Tahun pengalaman" },
    { value: "3", label: "Lini produk utama" },
    { value: "100+", label: "Mitra laboratorium" },
  ],
  knowTitle: "Get to Know YOFALAB",
  knowBody:
    "Kami membantu laboratorium, rumah sakit, dan puskesmas memperoleh alat kesehatan serta reagen laboratorium yang tepat, dengan dukungan teknis dari tim yang memahami kebutuhan pemeriksaan sehari-hari.",
  advantages: [
    {
      title: "Produk Berkualitas",
      body: "Produk yang kami sediakan berasal dari produsen terpilih dan disimpan sesuai ketentuan suhu penyimpanan.",
    },
    {
      title: "Dukungan Teknis",
      body: "Tim kami membantu memilih produk yang sesuai jenis pemeriksaan dan menjawab pertanyaan teknis penggunaan.",
    },
    {
      title: "Jangkauan Layanan",
      body: "Pengiriman ke berbagai daerah di Indonesia dengan pengemasan yang menjaga kondisi produk.",
    },
  ],
};

async function main() {
  for (const c of PRODUCT_CATEGORIES) {
    await db.productCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
    });
  }

  const postCategory = await db.postCategory.upsert({
    where: { slug: "health" },
    update: { name: "Health" },
    create: { name: "Health", slug: "health" },
  });

  const settings: { key: string; value: object }[] = [
    {
      key: "contact",
      value: {
        address:
          "Jl. Amarta No.12 A RT01, RW.01, Pelem, Baturetno, Banguntapan, Bantul Regency, Special Region of Yogyakarta 55198",
        phone: "(0274) 4436047",
        whatsapp: "+62 811-255-450",
        email: "info@yofalab.com",
      },
    },
    {
      key: "footer",
      value: {
        copyright:
          "Copyright \u00a9 2026 YOFALAB Indonesia. All rights reserved.",
        description:
          "Penyedia alat kesehatan dan reagen laboratorium untuk rumah sakit, laboratorium klinik, dan puskesmas di Indonesia.",
      },
    },
    {
      key: "site",
      value: {
        name: "YOFALAB Indonesia",
        tagline:
          "Company profile dan katalog produk alat kesehatan YOFALAB Indonesia.",
        seoTitle: "YOFALAB Indonesia — Alat Kesehatan & Reagen Laboratorium",
        seoDescription:
          "YOFALAB Indonesia menyediakan blood grouping reagent, vacuum blood collection, dan hemoglobin meter berkualitas untuk laboratorium.",
        notifyEmail: "",
      },
    },
    { key: "upload", value: { maxUploadMb: 5 } },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  await db.page.upsert({
    where: { key: "ABOUT" },
    update: { content: ABOUT_CONTENT },
    create: { key: "ABOUT", content: ABOUT_CONTENT },
  });

  await db.page.upsert({
    where: { key: "HOME" },
    update: { content: HOME_CONTENT },
    create: { key: "HOME", content: HOME_CONTENT },
  });

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@yofalab.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Super Admin";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: "SUPER_ADMIN", isActive: true },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  for (const p of PRODUCTS) {
    const category = await db.productCategory.findUniqueOrThrow({
      where: { slug: p.categorySlug },
      select: { id: true },
    });

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        categoryId: category.id,
        name: p.name,
        shortDescription: p.shortDescription,
        specifications: p.specifications,
        applications: p.applications,
        status: "PUBLISHED",
        sortOrder: p.sortOrder,
      },
      create: {
        categoryId: category.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        specifications: p.specifications,
        applications: p.applications,
        status: "PUBLISHED",
        sortOrder: p.sortOrder,
      },
    });

    for (const tagName of p.tags) {
      const slug = tagName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const tag = await db.tag.upsert({
        where: { slug },
        update: { name: tagName },
        create: { name: tagName, slug },
      });
      await db.productTag.upsert({
        where: { productId_tagId: { productId: product.id, tagId: tag.id } },
        update: {},
        create: { productId: product.id, tagId: tag.id },
      });
    }
  }

  for (const p of POSTS) {
    const publishedAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000);
    await db.post.upsert({
      where: { slug: p.slug },
      update: {
        categoryId: postCategory.id,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        status: "PUBLISHED",
        publishedAt,
        seoDescription: p.seoDescription,
      },
      create: {
        categoryId: postCategory.id,
        authorId: admin.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        status: "PUBLISHED",
        publishedAt,
        seoDescription: p.seoDescription,
      },
    });
  }

  console.log(
    `Seed selesai: ${PRODUCT_CATEGORIES.length} kategori produk, ${PRODUCTS.length} produk, ${POSTS.length} artikel, halaman HOME/ABOUT, dan pengaturan situs.`,
  );
  console.log(`✔ Super Admin siap: ${adminEmail} (kata sandi: ${adminPassword}).`);
  console.log("⚠ Ganti kata sandi default ini di produksi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
