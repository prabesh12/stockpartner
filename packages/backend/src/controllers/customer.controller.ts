import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CreateCustomerRequest, RecordPaymentRequest } from 'shared';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    const customers = await prisma.customer.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
    });

    res.json(customers);
  } catch (error) {
    console.error('getCustomers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const { id } = req.params;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    const customer = await prisma.customer.findUnique({
      where: { id, shopId },
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    console.error('getCustomerById error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const userId = req.user?.userId;
    if (!shopId || !userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = req.body as CreateCustomerRequest;
    if (!data.name || !data.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const openingBalance = data.openingBalance ? Number(data.openingBalance) : 0;

    const customer = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          shopId,
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          address: data.address || null,
          openingBalance: openingBalance,
          totalDue: openingBalance,
        }
      });

      if (openingBalance !== 0) {
        await tx.customerLedger.create({
          data: {
            shopId,
            customerId: newCustomer.id,
            userId,
            type: openingBalance > 0 ? 'CREDIT' : 'PAYMENT',
            amount: Math.abs(openingBalance),
            balanceAfter: openingBalance,
            notes: 'Opening Balance',
            voucherNo: 'OP-0001', // Example initial voucher
          }
        });
      }

      return newCustomer;
    });

    res.status(201).json(customer);
  } catch (error: any) {
    console.error('createCustomer error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Customer with this phone already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const { id } = req.params;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    const data = req.body as Partial<CreateCustomerRequest>;

    const updated = await prisma.customer.update({
      where: { id, shopId },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('updateCustomer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const userId = req.user?.userId;
    const customerId = req.params.id;
    if (!shopId || !userId) return res.status(401).json({ error: 'Unauthorized' });

    const { amount, notes, paymentMethod } = req.body as RecordPaymentRequest;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId, shopId },
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Decrement due mapping to atomic properties
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          totalDue: { decrement: amount }
        }
      });

      // Generate a simple voucher number for payments: RCT-[short-id or counter]
      const count = await tx.customerLedger.count({ where: { shopId, type: 'PAYMENT' } });
      const voucherNo = `RCT-${(count + 1).toString().padStart(4, '0')}`;

      // 2. Insert chronological ledger locking state securely
      const ledgerEntry = await tx.customerLedger.create({
        data: {
          shopId,
          customerId,
          userId,
          type: 'PAYMENT',
          amount: amount,
          paymentMethod: paymentMethod || 'CASH',
          balanceAfter: updatedCustomer.totalDue,
          notes: notes || 'Payment Received',
          voucherNo,
        }
      });

      return { customer: updatedCustomer, ledgerEntry };
    });

    res.json(result.customer);
  } catch (error) {
    console.error('recordPayment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const getLedgers = async (req: Request, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    const customerId = req.params.id;
    if (!shopId) return res.status(401).json({ error: 'Unauthorized' });

    // Validate ownership
    const customer = await prisma.customer.findUnique({
      where: { id: customerId, shopId }
    });
    
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const ledgers = await prisma.customerLedger.findMany({
      where: { customerId, shopId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    res.json(ledgers);
  } catch (error) {
    console.error('getLedgers error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};
