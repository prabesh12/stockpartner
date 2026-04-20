import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { DashboardSummaryDTO } from 'shared';

export const getSummary = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalSales = await prisma.sale.aggregate({
      where: { shopId },
      _sum: { finalAmount: true },
    });
    const totalRevenue = Number(totalSales._sum.finalAmount || 0);

    const dailySalesRecords = await prisma.sale.findMany({
      where: {
        shopId,
        createdAt: { gte: startOfToday },
      },
      include: {
        saleItems: {
           include: { product: true }
        }
      }
    });

    const dailySalesCount = dailySalesRecords.length;
    let dailyRevenue = 0;
    let dailyCost = 0;

    dailySalesRecords.forEach(sale => {
      dailyRevenue += Number(sale.finalAmount);
      sale.saleItems.forEach(item => {
         dailyCost += Number(item.quantity) * Number(item.product.costPrice);
      });
    });

    const dailyProfit = dailyRevenue - dailyCost;

    const allProducts = await prisma.product.findMany({ where: { shopId } });
    const lowStockProductsRaw = allProducts.filter(p => Number(p.currentStock) <= Number(p.lowStockThreshold || 5));

    const mappedLowStock = lowStockProductsRaw.map(p => ({
        id: p.id,
        shopId: p.shopId,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        category: p.category,
        unitType: p.unitType,
        costPrice: Number(p.costPrice),
        sellingPrice: Number(p.sellingPrice),
        currentStock: Number(p.currentStock),
        lowStockThreshold: Number(p.lowStockThreshold),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    const topItemsAggregation = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { shopId } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topSellingProducts = await Promise.all(
       topItemsAggregation.map(async (agg) => {
          const product = await prisma.product.findUnique({ where: { id: agg.productId } });
          return {
             productId: agg.productId,
             name: product ? product.name : 'Unknown Product',
             totalQuantitySold: Number(agg._sum.quantity || 0),
             revenueGenerated: Number(agg._sum.subtotal || 0),
          };
       })
    );

    const response: DashboardSummaryDTO = {
      dailySalesCount,
      dailyRevenue,
      dailyProfit,
      totalRevenue,
      lowStockProducts: mappedLowStock,
      topSellingProducts,
    };

    res.json(response);

  } catch (error) {
    console.error('getSummary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};
