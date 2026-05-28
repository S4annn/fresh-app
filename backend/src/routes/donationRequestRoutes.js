import express from 'express'

import { getMyRequests, updateRequestStatus } from '../controllers/donationRequestController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { validate } from '../middleware/validate.js'
import { updateDonationRequestStatusSchema } from '../validator/donationRequestValidator.js'

const router = express.Router()

router.get('/my', verifyToken, allowRoles('pribadi'), getMyRequests)
router.patch('/:id/status', verifyToken, allowRoles('pribadi'), validate(updateDonationRequestStatusSchema), updateRequestStatus)

export default router