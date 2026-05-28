import {
  cancelSubscriptionService,
  createCheckoutService,
  getAllPlansService,
  getCurrentSubscriptionService,
  getPaymentHistoryService,
  simulatePaymentService,
} from '../services/subscriptionServices.js'

export const getPlans = (req, res, next) => {
  try {
    const plans = getAllPlansService()
    return res.status(200).json({
      status: 'success',
      message: 'Daftar paket berhasil diambil',
      data: plans,
    })
  } catch (error) {
    next(error)
  }
}

export const getMySubscription = async (req, res, next) => {
  try {
    const data = await getCurrentSubscriptionService(req.user.id)
    return res.status(200).json({
      status: 'success',
      message: 'Subscription berhasil diambil',
      data,
    })
  } catch (error) {
    next(error)
  }
}

export const checkout = async (req, res, next) => {
  try {
    const { plan, billing_cycle = 'monthly' } = req.body || {}
    const data = createCheckoutService({
      userId: req.user.id,
      plan,
      billing_cycle,
    })
    return res.status(200).json({
      status: 'success',
      message: 'Checkout simulasi siap diproses',
      data,
    })
  } catch (error) {
    next(error)
  }
}

export const simulatePayment = async (req, res, next) => {
  try {
    const {
      plan,
      billing_cycle = 'monthly',
      payment_method = 'simulation_card',
    } = req.body || {}
    const data = await simulatePaymentService({
      userId: req.user.id,
      plan,
      billing_cycle,
      payment_method,
    })
    return res.status(200).json({
      status: 'success',
      message: 'Pembayaran simulasi berhasil. Subscription aktif.',
      data,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelSubscription = async (req, res, next) => {
  try {
    const data = await cancelSubscriptionService(req.user.id)
    return res.status(200).json({
      status: 'success',
      message: 'Subscription dibatalkan. Akun kembali ke paket Free.',
      data,
    })
  } catch (error) {
    next(error)
  }
}

export const getPaymentHistory = async (req, res, next) => {
  try {
    const data = await getPaymentHistoryService(req.user.id)
    return res.status(200).json({
      status: 'success',
      message: 'Riwayat pembayaran berhasil diambil',
      data,
    })
  } catch (error) {
    next(error)
  }
}
