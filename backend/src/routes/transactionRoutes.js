import express from 'express'

import { create, getMyOrders, getSales, getDetail, updateStatus } from '../controllers/transactionController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validate.js'
import { createTransactionSchema, updateTransactionStatusSchema } from '../validator/transactionValidator.js'

const router = express.Router()

router.post('/', verifyToken, allowRoles('pribadi'), validate(createTransactionSchema), create)
router.get('/my-orders', verifyToken, allowRoles('pribadi'), getMyOrders)
router.get('/sales', verifyToken, allowRoles('bisnis'), getSales)
router.get('/:id', verifyToken, getDetail)
router.patch('/:id/status', verifyToken, allowRoles('bisnis'), validate(updateTransactionStatusSchema), updateStatus)

export default router