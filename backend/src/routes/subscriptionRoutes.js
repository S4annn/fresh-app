import express from 'express'
import {
  cancelSubscription,
  checkout,
  getMySubscription,
  getPaymentHistory,
  getPlans,
  simulatePayment,
} from '../controllers/subscriptionController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public — anyone (even guests) can browse pricing.
router.get('/plans', getPlans)

// Authenticated — user-specific data.
router.get('/me', verifyToken, getMySubscription)
router.post('/checkout', verifyToken, checkout)
router.post('/simulate-payment', verifyToken, simulatePayment)
router.post('/cancel', verifyToken, cancelSubscription)
router.get('/payments', verifyToken, getPaymentHistory)

export default router
