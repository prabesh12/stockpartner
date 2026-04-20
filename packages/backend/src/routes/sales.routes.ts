import { Router } from 'express';
import { createSale } from '../controllers/sales.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/checkout', createSale);

export default router;
