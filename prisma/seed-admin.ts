import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

/**
 * Skrip seed Super Admin pertama.
 * Idempoten: bila email sudah ada, kata sandi & data diperbarui.
 *
 * Kredensial awal dibaca dari env bila ada, jika tidak memakai default
 * pengembangan. WAJIB ganti kata sandi default di produksi.
 */
async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@yofalab.com"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "SUPER_ADMIN", isActive: true },
    create: {
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`✔ Super Admin siap: ${email}`);
  console.log(`  Kata sandi: ${password}`);
  console.log("  ⚠ Ganti kata sandi ini setelah login pertama di produksi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
