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

    // ─── Pre-fetch all products OUTSIDE the transaction (fast read) ───────────
    const productIds = payload.items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, shopId },
    });

    // Validate stock availability before entering the transaction
    const productMap = new Map(products.map(p => [p.id, p]));
    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (Number(product.currentStock) < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
    }

    // ─── Run the transaction with a generous timeout ───────────────────────────
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Insert main Sale record
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

      // 2. Process all items in parallel (create line-items, deduct stock, write audit)
      await Promise.all(payload.items.map(async (item) => {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.total,
          }
        });

        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } }
        });

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
      }));

      // 3. Resolve Credit / Udhar Ledger logic
      if (payload.customerId) {
        const debtIncurred = payload.finalAmount - payload.paidAmount;
        const isPartiallyPaid = debtIncurred > 0;
        const isFullyPaid = payload.finalAmount === payload.paidAmount && payload.finalAmount > 0;

        if (isPartiallyPaid || isFullyPaid) {
          // Read the customer's latest balance
          const latestLedger = await tx.customerLedger.findFirst({
            where: { customerId: payload.customerId },
            orderBy: { createdAt: 'desc' }
          });
          const currentBalance = latestLedger ? Number(latestLedger.balanceAfter) : 0;

          // Generate voucher number: INV-[counter]
          const saleCount = await tx.sale.count({ where: { shopId } });
          const voucherNo = `INV-${saleCount.toString().padStart(4, '0')}`;

          // Double Entry 1: Record full sale as CREDIT (debt created)
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
              notes: isFullyPaid ? 'Sale Issued (Fully Paid)' : 'Sale Issued',
              voucherNo,
            }
          });

          // Double Entry 2: Record any upfront payment as PAYMENT (debt offset)
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
                notes: `${isFullyPaid ? 'Fully Paid' : 'Upfront Payment'}`,
                paymentMethod: payload.paymentMethod,
                voucherNo,
              }
            });
          }

          // Update the customer's running total
          await tx.customer.update({
            where: { id: payload.customerId },
            data: { totalDue: finalBalAfter }
          });
        }
      }

      return newSale;
    }, {
      timeout: 15000,  // 15s max transaction duration
      maxWait: 5000,   // 5s max wait to acquire a connection
    });

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('POS Checkout Error:', error);
    res.status(400).json({ error: error.message || 'Failed to process POS checkout' });
  }
};
