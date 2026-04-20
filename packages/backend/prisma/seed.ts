import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial platform data...');

  // 1. Create a master dummy shop just to satisfy the database schema constraints
  const platformShop = await prisma.shop.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' }, // Hardcode UUID to act as a unique identifier for Upsert safely if unique constraints don't exist perfectly on Name. Wait, Shop doesn't have unique Name.
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Stocksathi System Platform',
      address: 'Internal System Architecture',
    },
  });

  // 2. Create the Platform Admin explicitly tied to the dummy system shop
  const adminEmail = 'admin@stocksathi.com';
  const rawPassword = 'superadminsecure123'; // The installer will run this manually, then delete it or change it in DB
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'PLATFORM_ADMIN',
    },
    create: {
      shopId: platformShop.id,
      name: 'System Administrator',
      email: adminEmail,
      phone: '0000000000',
      passwordHash: hashedPassword,
      role: 'PLATFORM_ADMIN',
    },
  });

  console.log(`\n✅ Seeding Successful`);
  console.log(`Platform Admin Email: ${adminEmail}`);
  console.log(`Default Password: ${rawPassword}`);
  console.log(`\n(Please log in to the dashboard immediately and update these credentials)\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
