import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('--- Starting Seeding ---');

  // 1. Create Admin User
  const adminShop = await prisma.shop.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Deterministic UUID for seeding
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'StockSathi Admin HQ',
      address: 'Kathmandu, Nepal',
      contactNumber: '9800000000',
      categories: ['Admin'],
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stocksathi.com' },
    update: {
      passwordHash: hashedPassword,
      isVerified: true,
      role: 'PLATFORM_ADMIN',
    },
    create: {
      shopId: adminShop.id,
      name: 'System Admin',
      email: 'admin@stocksathi.com',
      phone: '9800000000',
      passwordHash: hashedPassword,
      role: 'PLATFORM_ADMIN',
      isVerified: true,
    },
  });
  console.log('Admin user created/updated:', adminUser.email);

  // 2. Create Test User 1
  const test1Shop = await prisma.shop.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Prabesh Electronics',
      address: 'Butwal, Nepal',
      contactNumber: '9742960363',
      categories: ['Electronics', 'Retail'],
    },
  });

  const testUser1 = await prisma.user.upsert({
    where: { email: 'test1@stocksathi.com' },
    update: {
      passwordHash: hashedPassword,
      isVerified: true,
      phone: '9742960363',
    },
    create: {
      shopId: test1Shop.id,
      name: 'Prabesh Test User',
      email: 'test1@stocksathi.com',
      phone: '9742960363',
      passwordHash: hashedPassword,
      role: 'OWNER',
      isVerified: true,
    },
  });
  console.log('Test user 1 created/updated:', testUser1.phone);

  // 3. Create Test User 2
  const test2Shop = await prisma.shop.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Sathi General Store',
      address: 'Pokhara, Nepal',
      contactNumber: '9761155107',
      categories: ['Groceries', 'Daily Needs'],
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'test2@stocksathi.com' },
    update: {
      passwordHash: hashedPassword,
      isVerified: true,
      phone: '9761155107',
    },
    create: {
      shopId: test2Shop.id,
      name: 'Sathi Test User',
      email: 'test2@stocksathi.com',
      phone: '9761155107',
      passwordHash: hashedPassword,
      role: 'OWNER',
      isVerified: true,
    },
  });
  console.log('Test user 2 created/updated:', testUser2.phone);

  console.log('--- Seeding Completed ---');
  console.log('Default Password for all: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
