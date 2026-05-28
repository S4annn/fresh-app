import express from 'express'

import { create, getAll, updateStatus, remove,} from '../controllers/donationController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validate.js'
import { createDonationSchema, updateDonationStatusSchema } from '../validator/donationValidator.js'
import { createRequest, getRequests } from '../controllers/donationRequestController.js'
import { createDonationRequestSchema } from '../validator/donationRequestValidator.js'

const router = express.Router()

router.get('/', verifyToken, allowRoles('pribadi'), getAll)
router.post('/', verifyToken, allowRoles('pribadi'), validate(createDonationSchema), create)
router.patch('/:id/status', verifyToken, allowRoles('pribadi'), validate(updateDonationStatusSchema), updateStatus)
router.delete('/:id', verifyToken, allowRoles('pribadi'), remove)
router.post('/:id/requests', verifyToken, allowRoles('pribadi'), validate(createDonationRequestSchema), createRequest)
router.get('/:id/requests', verifyToken, allowRoles('pribadi'), getRequests)

export default router