import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CreateSaleRequest } from 'shared';

export const createSale = async (req: Request, res: Response) => {
  try {
    const { shopId, userId } = req.user!;
    const payload = req.body as CreateSaleRequest;

    if (!payload.items || payload.items.length === 0) {
      return res.status(400).json({ error: 'Sale must contain at least one item' });
    }

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Validate Stock Limits pre-emptively
      for (const item of payload.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product || product.shopId !== shopId) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (Number(product.currentStock) < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
      }

      // 2. Insert main Sale Record
      const newSale = await tx.sale.create({
        data: {
          shopId,
          userId,
          customerId: payload.customerId || null,
          totalAmount: payload.totalAmount,
          discountAmount: payload.discountAmount || 0,
          finalAmount: payload.finalAmount,
          paidAmount: payload.paidAmount,
          paymentMethod: payload.paymentMethod,
          notes: payload.notes,
        }
      });

      // 3. Process Items and update Inventory concurrently
      for (const item of payload.items) {
        // Create line item
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.total,
          }
        });

        // Deduct logic
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity }
          }
        });

        // Write Audit ledger
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: item.productId,
            userId,
            type: 'SALE',
            quantityChanged: item.quantity,
            balanceAfter: updatedProduct.currentStock,
            referenceId: newSale.id,
            notes: 'POS Sale Checkout'
          }
        });
      }

      // 4. Resolve Credit / Udhar Ledger logic
      if (payload.customerId) {
        if (payload.finalAmount > payload.paidAmount) {
          const debtIncurred = payload.finalAmount - payload.paidAmount;

          const latestLedger = await tx.customerLedger.findFirst({
            where: { customerId: payload.customerId },
            orderBy: { createdAt: 'desc' }
          });
          const currentBalance = latestLedger ? Number(latestLedger.balanceAfter) : 0;

          // Double Entry 1: Write Full Sale as CREDIT
          const creditBalAfter = currentBalance + payload.finalAmount;
          await tx.customerLedger.create({
             data: {
                shopId,
                customerId: payload.customerId,
                userId,
                type: 'CREDIT',
                amount: payload.finalAmount,
                balanceAfter: creditBalAfter,
                referenceId: newSale.id,
                notes: 'Sale Issued'
             }
          });

          // Double Entry 2: Write Partial Payment to offset if applicable natively
          let finalBalAfter = creditBalAfter;
          if (payload.paidAmount > 0) {
             finalBalAfter = creditBalAfter - payload.paidAmount;
             await tx.customerLedger.create({
                data: {
                   shopId,
                   customerId: payload.customerId,
                   userId,
                   type: 'PAYMENT',
                   amount: payload.paidAmount,
                   balanceAfter: finalBalAfter,
                   referenceId: newSale.id,
                   notes: `Upfront Payment via ${payload.paymentMethod}`
                }
             });
          }

          // Persist the top-level metric on Customer record natively
          await tx.customer.update({
            where: { id: payload.customerId },
            data: { totalDue: finalBalAfter }
          });
        } else if (payload.finalAmount === payload.paidAmount && payload.finalAmount > 0) {
           // Fully paid exactly, maybe track history for consistency
          const latestLedger = await tx.customerLedger.findFirst({
            where: { customerId: payload.customerId },
            orderBy: { createdAt: 'desc' }
          });
          const currBal = latestLedger ? Number(latestLedger.balanceAfter) : 0;
          
          await tx.customerLedger.create({
            data: {
               shopId, customerId: payload.customerId, userId,
               type: 'CREDIT', amount: payload.finalAmount, balanceAfter: currBal + payload.finalAmount,
               referenceId: newSale.id, notes: 'Sale Issued (Fully Paid)'
            }
          });
          await tx.customerLedger.create({
            data: {
               shopId, customerId: payload.customerId, userId,
               type: 'PAYMENT', amount: payload.paidAmount, balanceAfter: currBal, // Nets back down to original safely
               referenceId: newSale.id, notes: `Fully Paid Upfront via ${payload.paymentMethod}`
            }
          });
        }
      }

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('POS Checkout Error:', error);
    res.status(400).json({ error: error.message || 'Failed to process POS checkout natively' });
  }
};
