import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CreateProductRequest, UpdateProductRequest } from 'shared';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const userId = req.user?.userId;
    if (!shopId || !userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = req.body as CreateProductRequest;
    if (!data.name || data.costPrice === undefined || data.sellingPrice === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const initialStock = data.currentStock !== undefined ? data.currentStock : 0;
    if (initialStock < 0) {
      return res.status(400).json({ error: 'Initial stock cannot be negative' });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          shopId,
          name: data.name,
          sku: data.sku?.trim() || null,
          barcode: data.barcode?.trim() || null,
          category: data.category?.trim() || null,
          unitType: data.unitType?.trim() || "PCs",
          costPrice: data.costPrice as number,
          sellingPrice: data.sellingPrice as number,
          currentStock: initialStock,
        }
      });

      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: newProduct.id,
            userId,
            type: 'ADJUSTMENT',
            quantityChanged: initialStock,
            balanceAfter: initialStock,
            notes: 'Initial stock setup',
          }
        });
      }
      return newProduct;
    }, { maxWait: 10000, timeout: 20000 });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('createProduct error:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'A product with this Barcode or SKU already exists in your shop' });
    }
    res.status(500).json({ error: error?.message || 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!shopId || !userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = req.body as UpdateProductRequest;

    const existingProduct = await prisma.product.findUnique({
      where: { id, shopId }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.currentStock !== undefined && Number(data.currentStock) !== Number(existingProduct.currentStock)) {
         const delta = Number(data.currentStock) - Number(existingProduct.currentStock);
         
         if (Number(existingProduct.currentStock) + delta < 0) {
           throw new Error('Target stock quantity would result in negative bounds');
         }

         const updated = await tx.product.update({
           where: { id },
           data: {
             name: data.name !== undefined ? data.name : existingProduct.name,
             sku: data.sku !== undefined ? data.sku : existingProduct.sku,
             barcode: data.barcode !== undefined ? data.barcode : existingProduct.barcode,
             category: data.category !== undefined ? data.category : existingProduct.category,
             unitType: data.unitType !== undefined ? data.unitType : existingProduct.unitType,
             costPrice: data.costPrice !== undefined ? data.costPrice : existingProduct.costPrice,
             sellingPrice: data.sellingPrice !== undefined ? data.sellingPrice : existingProduct.sellingPrice,
             currentStock: { increment: delta }
           }
         });

         await tx.stockMovement.create({
           data: {
             shopId,
             productId: id,
             userId,
             type: 'ADJUSTMENT',
             quantityChanged: delta,
             balanceAfter: updated.currentStock,
             notes: 'Manual stock override',
           }
         });

         return updated;
      } else {
         return await tx.product.update({
           where: { id },
           data: {
             name: data.name !== undefined ? data.name : existingProduct.name,
             sku: data.sku !== undefined ? data.sku : existingProduct.sku,
             barcode: data.barcode !== undefined ? data.barcode : existingProduct.barcode,
             category: data.category !== undefined ? data.category : existingProduct.category,
             unitType: data.unitType !== undefined ? data.unitType : existingProduct.unitType,
             costPrice: data.costPrice !== undefined ? data.costPrice : existingProduct.costPrice,
             sellingPrice: data.sellingPrice !== undefined ? data.sellingPrice : existingProduct.sellingPrice,
           }
         });
      }
    }, { maxWait: 10000, timeout: 20000 });

    res.json(result);
  } catch (error: any) {
    console.error('updateProduct error:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Another product with this Barcode or SKU already exists in your shop' });
    }
    if (error.message === 'Target stock quantity would result in negative bounds') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const { id } = req.params;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.product.delete({
      where: { id, shopId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
