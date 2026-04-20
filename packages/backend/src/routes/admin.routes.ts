import { Router } from 'express';
import { getPlatformStats, getAllShops } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePlatformAdmin } from '../middleware/admin.middleware';

const router = Router();

// Apply overlapping auth sequences
router.use(authenticateToken);
router.use(requirePlatformAdmin); 

router.get('/stats', getPlatformStats);
router.get('/shops', getAllShops);

export default router;
