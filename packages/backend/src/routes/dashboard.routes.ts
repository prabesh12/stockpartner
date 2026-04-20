import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/summary', getSummary);

export default router;
