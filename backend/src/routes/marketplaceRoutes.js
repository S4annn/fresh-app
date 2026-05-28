import express from 'express';

import { getAll, getOne } from '../controllers/productController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getOne);

export default router;