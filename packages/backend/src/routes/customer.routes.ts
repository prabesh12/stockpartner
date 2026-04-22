import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, recordPayment, getLedgers } from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken); // Standard protection

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.post('/:id/payment', recordPayment);
router.get('/:id/ledger', getLedgers);

export default router;
