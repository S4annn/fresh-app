import express from 'express';
import { create, getAll } from '../controllers/inventoryOutController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createInventoryOutSchema } from '../validator/inventoryOutValidator.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/:inventoryId/out', verifyToken, allowRoles('pribadi'), validate(createInventoryOutSchema), create);
router.get('/', verifyToken, allowRoles('pribadi'), getAll);

export default router;
