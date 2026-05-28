import express from 'express'

import { create, getAll, getOne, update, remove } from '../controllers/inventoryController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import { validateQuery } from '../middleware/validateQuery.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { createInventorySchema, updateInventorySchema, inventoryFilterSchema } from '../validator/inventoryValidator.js'

const router = express.Router()

router.post('/', verifyToken, allowRoles('pribadi'), validate(createInventorySchema), create)
router.get('/', verifyToken, allowRoles('pribadi'), validateQuery(inventoryFilterSchema), getAll)
router.get('/:id', verifyToken, allowRoles('pribadi'), getOne)
router.put('/:id', verifyToken, allowRoles('pribadi'), validate(updateInventorySchema), update)
router.delete('/:id', verifyToken, allowRoles('pribadi'), remove)

export default router