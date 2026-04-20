import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const addCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const shopId = req.user.shopId;
    const { category } = req.body;

    if (!category) return res.status(400).json({ error: 'Category string is required' });

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    if (shop.categories.includes(category)) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        categories: {
          push: category
        }
      }
    });

    res.status(200).json({ categories: updatedShop.categories });
  } catch (error) {
    console.error('Add Category Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
