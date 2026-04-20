import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { addCategory } from '../controllers/shop.controller';

const router = Router();

router.use(authenticateToken);
router.post('/categories', addCategory);

export default router;
