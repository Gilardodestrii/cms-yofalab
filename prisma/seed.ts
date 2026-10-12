import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

/**
 * Data awal YOFALAB, selaras dengan bagian "Data awal" pada `docs/schema.sql`.
 * Idempoten: aman dijalankan berulang kali.
 */
async function main() {
  const categories = [
    { name: "Blood Grouping Reagent", slug: "blood-grouping-reagent", sortOrder: 1 },
    { name: "Vacum Blood Collection Series", slug: "vacum-blood-collection-series", sortOrder: 2 },
    { name: "Hemoglobin Meter", slug: "hemoglobin-meter", sortOrder: 3 },
  ];

  for (const c of categories) {
    await db.productCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }

  await db.postCategory.upsert({
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
      },
    },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("Seed selesai: kategori produk, kategori blog, dan pengaturan situs.");
}

/** Buat/perbarui Super Admin pertama dari env (default pengembangan). */
async function seedAdmin() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@yofalab.com"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "SUPER_ADMIN", isActive: true },
    create: { name, email, passwordHash, role: "SUPER_ADMIN", isActive: true },
  });

  console.log(`Seed admin selesai: ${email} (kata sandi: ${password}).`);
  console.log("⚠ Ganti kata sandi default ini di produksi.");
}

main()
  .then(seedAdmin)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
