import express from 'express';

import { create, getMine, update, updateStatus, remove } from '../controllers/productController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema, updateProductStatusSchema } from '../validator/productValidator.js';

const router = express.Router();

router.get('/my-products', verifyToken, allowRoles('bisnis'), getMine);
router.post('/', verifyToken, allowRoles('bisnis'), validate(createProductSchema), create);
router.put('/:id', verifyToken, allowRoles('bisnis'), validate(updateProductSchema), update);
router.patch('/:id/status', verifyToken, allowRoles('bisnis'), validate(updateProductStatusSchema), updateStatus);
router.delete('/:id', verifyToken, allowRoles('bisnis'), remove);

export default router;