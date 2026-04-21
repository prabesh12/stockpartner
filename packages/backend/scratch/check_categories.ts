import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      category: true,
      name: true
    }
  });
  console.log('--- PRODUCTS IN DB ---');
  console.log(JSON.stringify(products, null, 2));
  
  const shops = await prisma.shop.findMany({
    select: {
      name: true,
      users: {
        select: {
          isVerified: true,
          role: true
        }
      }
    }
  });
  console.log('\n--- SHOPS AND VERIFICATION ---');
  console.log(JSON.stringify(shops, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
