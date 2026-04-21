import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getPublicProducts, getPublicProductDetail, getPublicCategories, getPublicShopProducts } from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// PUBLIC ROUTES - No authentication required
router.get('/public', getPublicProducts);
router.get('/public/categories', getPublicCategories);
router.get('/public/shop/:shopId/products', getPublicShopProducts);
router.get('/public/:id', getPublicProductDetail);

// PROTECTED ROUTES - Authentication required
router.use(authenticateToken);

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
