import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const totalShops = await prisma.shop.count();
    const totalUsers = await prisma.user.count();
    const totalSales = await prisma.sale.count();
    
    // Globally sums finalAmount ignoring shopId filter safely
    const platformRevenueAggr = await prisma.sale.aggregate({
      _sum: { finalAmount: true }
    });
    
    res.json({
      totalShops,
      totalUsers,
      totalSales,
      platformRevenue: Number(platformRevenueAggr._sum.finalAmount || 0)
    });
  } catch (error) {
    console.error('getPlatformStats error:', error);
    res.status(500).json({ error: 'Failed to fetch global metrics' });
  }
};

export const getAllShops = async (req: Request, res: Response) => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        users: {
          where: { role: 'OWNER' },
          select: { name: true, email: true, phone: true }
        },
        _count: {
          select: { products: true, sales: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedShops = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      createdAt: shop.createdAt,
      owner: shop.users[0] || null,
      productCount: shop._count.products,
      saleCount: shop._count.sales
    }));

    res.json(formattedShops);
  } catch (error) {
    console.error('getAllShops error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
};
