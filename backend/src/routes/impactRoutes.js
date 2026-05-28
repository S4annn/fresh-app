import express from 'express'
import {
  getPersonalImpact,
  getBusinessImpact,
} from '../controllers/impactController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/personal', verifyToken, allowRoles('pribadi'), getPersonalImpact)
router.get('/business', verifyToken, allowRoles('bisnis'), getBusinessImpact)

export default router
